import express from 'express'
import db from '../db/postgres.js'
import {validator,validateRID} from '../utils/validator.js'
import getISTDate from '../utils/getISTDate.js'

const requestRouter = express.Router()

//Add a new request
requestRouter.post('/new',
validator(["name","mobileNo","requestSubject","requestCategory","requestBody","status","statusUser"],["email","address","loksabha","assembly","panchayat","ward","pincode","documents"]),
async (req,res) => {

    const uuid = req.body.uuid

    var queryText = `
    insert into requests(posted_time,updated_time,user_id,name,mobile_no,email,address,loksabha,assembly,panchayat,ward,pincode,request_subject,request_category,request_body,status, status_user,documents)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) returning r_id`

    const postedTime = new getISTDate().toISOString()
    var queryValues = [postedTime,postedTime]

     const {documents}= req.body

    const requestFields = ["name","mobileNo","email","address","loksabha","assembly","panchayat","ward","pincode","requestSubject","requestCategory","requestBody","status","statusUser"]

    queryValues.push(uuid)

    requestFields.forEach((key) => {
        if (key in req.body) {
            queryValues.push(req.body[key])
        } else {
            if (key=="pincode") {
                queryValues.push(0)
            } 
            else{
            queryValues.push("-")
        }
    }})

    if (documents) {
        queryValues.push(documents)
    } else {
        queryValues.push("{}")
    }

    var client
    try {
        client = await db.connect()
        await client.query('BEGIN')

        const result = await client.query(queryText,queryValues)
        const {r_id:rid} = result.rows[0]
        await client.query('COMMIT')

        res.status(201).send({
            rid
        })

    } catch (e) {
        console.log(e)
        client.query('ROLLBACK', (err) => null)
        res.status(500).send({
            message:"Server Error"
        })

    } finally {
        if (client) client.release()
    }
})

//Update a new request

requestRouter.patch('/:rid',
validateRID,
validator([],['name' ,'mobileNo','email','address','loksabha','assembly','panchayat','ward','pincode','documents','status','statusUser','requestBody','requestCategory','requestSubject']),
async (req,res) => {
    const {name ,mobileNo,email,address,loksabha,assembly,panchayat,ward,pincode,documents,status,statusUser} = req.body
    
    const uuid = req.body.uuid
    const rid = req.params.rid
    const updatedTime = new getISTDate().toISOString()
    var queryText = `update requests set updated_time = '${updatedTime}'`
    var queryValues = [rid]
    var valueIndex = 2

    const columnName = {
        name:"name",
        mobileNo: "mobile_no",
        email: "email",
        address: "address",
        loksabha: "loksabha",
        assembly: "assembly",
        panchayat:"panchayat",
        ward:"ward",
        pincode:"pincode",
        requestSubject:"request_subject",
        requestCategory:"request_category",
        requestBody:"request_body",
        documents : "documents",
        status: "status",
        statusUser: "status_user"
    }

    for (const key in req.body) {
        if (key=='uuid') continue
        queryText += `, ${columnName[key]} = \$${valueIndex}`
        valueIndex+=1
        queryValues.push(req.body[key])
    }


    queryText += ` where r_id=$1`

    var client
    try {
        client = await db.connect()

        const result = await client.query(queryText,queryValues)

        if (result.rowCount==0) {
            return res.status(404).send()
        }
        res.status(204).send()
    } catch (e) {
        console.log(e)
        res.status(500).send()
    } finally {
        if (client) client.release()
    }
})


//View a set of requests

requestRouter.post('/',
validator([],['date','name','loksabha','assembly','pincode','panchayat','mobileNo','email','ward','status','statusUser']),
async (req,res) => {

    const {date,name,loksabha,assembly,pincode,panchayat,mobileNo,email,ward,status,statusUser} = req.body
    const uuid = req.body.uuid
    var queryText = `select * from requests where user_id = '${uuid}' `
    var queryValues=[]
    var valueIndex = 1

    const columnName = {
        name:"name",
        mobileNo: "mobile_no",
        email:"email",
        address:"address",
        loksabha:"loksabha",
        assembly:"assembly",
        panchayat:"panchayat",
        ward:"ward",
        pincode:"pincode",
        requestSubject:"request_subject",
        requestCategory:"request_category",
        requestBody:"request_body",
        status:"status",
        statusUser:"status_user"
    }
    
    for (const key in req.body) {
        if (key=="uuid"|| key=="date") continue
        queryText += ` AND ${columnName[key]} = \$${valueIndex}`
        valueIndex+=1
        queryValues.push(req.body[key])
    }
  
    
    if (date) {
        queryText += ` AND posted_time BETWEEN date '${date}' and date '${date}'+1 ;`
    }

    try {
        const result = await db.query(queryText,queryValues)

        if (result.rowCount==0) {
            return res.status(404).send({
                details : "No requests yet"
            })
        }
        res.status(200).send(
            {
                details: Array.from(
                    result.rows,
                    (row) => {
                        const { r_id:rid, user_id:uid, posted_time:postedTime, status, status_user:statusUser, request_subject:requestSubject, request_category:requestCategory, request_body:requestBody } = row
                        return {
                            rid,
                            uid,
                            postedTime,
                            status,
                            statusUser,
                            requestSubject,
                            requestCategory,
                            requestBody
                        }
                    }
                )
        })
    } catch (e) {
        console.log(e)
        res.status(500).send()
    } 
})

//View details of a certain request

requestRouter.get('/:rid',
validateRID,
async (req,res) => {

    const uuid = req.body.uuid
    const rid = req.params.rid
    const queryText = ` select name,loksabha,assembly,pincode,address,panchayat,mobile_no,email,ward,status,status_user,updated_time,posted_time,documents,request_body,request_category,request_subject,user_id from requests where r_id=$1`
    const queryValues = [rid]

    try {

        const result = await db.query(queryText,queryValues)

        if (result.rowCount==0) {
            return res.status(404).send({
                details : "Request not found"
            })
        }
        const {name,loksabha,assembly,pincode,panchayat,mobile_no:mobileNo,email,address,ward,status,status_user:statusUser,updated_time:updatedTime,posted_time:postedTime,documents, request_body:requestBody, request_category:requestCategory, request_subject:requestSubject, user_id:uid} = result.rows[0]
        
        
        
        if (uuid ==uid) {
        return res.status(200).send({
            name,
            loksabha,
            assembly,
            pincode,
            panchayat,
            mobileNo,
            email,
            address,
            ward,
            status,
            statusUser,
            updatedTime,
            postedTime,
            documents,
            requestBody,
            requestCategory,
            requestSubject
        }) } else {
            res.status(401).send({"message":"Unauthorized!"})
        }

    } catch (e) {
        console.log(e)
        return res.status(500).send()
    }
})
//Delete a  request

requestRouter.delete('/:rid',
validateRID,
async (req,res) => {

    const rid = req.params.rid

    const moveRequestQueryText = `insert into del_requests (posted_time,updated_time,user_id,name,mobile_no,email,address,loksabha,assembly,panchayat,ward,pincode,request_subject,request_category,request_body,documents,r_id)
    select posted_time::timestamp, updated_time::timestamp, user_id,name,mobile_no,email,address,loksabha,assembly,panchayat,ward,pincode,request_subject,request_category,request_body,documents,r_id from requests where r_id = $1`

    const requestQueryText = `delete from requests where r_id =$1`

    const moveActionsQueryText = ` insert into del_actions (posted_time,updated_time,r_id,act_no,action_subject,action_body,action_reply)
     select posted_time::timestamp,updated_time::timestamp,r_id,act_no,action_subject,action_body,action_reply from actions where r_id = $1
     `
    const actionQueryText = `delete from actions where r_id = $1`

    const queryValues = [rid]

    var client

    try {
        client = await db.connect()

        await client.query('BEGIN')

        await client.query(moveRequestQueryText,queryValues)
        await client.query(requestQueryText,queryValues)
        await client.query(moveActionsQueryText,queryValues)
        await client.query(actionQueryText,queryValues)

        await client.query('COMMIT')

        res.status(204).send()

    } catch (e) {
        console.log(e)
        client.query('ROLLBACK', (err) => null)
        res.status(500).send()
    } finally {
        if (client) client.release()
    }
})

export default requestRouter