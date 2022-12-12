import express from 'express'
import db from '../db/postgres.js'
import {validator,validateRID} from '../utils/validator.js'
import adminAuth from '../utils/adminAuth.js'

const adminRouter = express.Router()

// Get all requests with status and other parameters

adminRouter.post('/requests/',
validator([],['date','name','loksabha','assembly','pincode','panchayat','mobileNo','email','ward','status','statusUser']),
async (req,res) => {

    // const uuid = req.body.uuid

    // if (adminAuth(uuid)) {
    // } else {
    //     return res.status(401).send({
    //         message: "Unauthorized!"
    //     })
    // }

    const {date,name,loksabha,assembly,pincode,panchayat,mobileNo,email,ward,status,statusUser} = req.body
    
    var queryText = `select * from requests where status = $1 `
    var queryValues=[status]
    valueIndex = 2

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
        requestBody:"request_body",
        status:"status",
        statusUser:"status_user"
    }
    
    for (const key in req.body) {
        if (key=="uuid"|| key=="date" || key=="status") continue
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
                        const { r_id:rid, user_id:uid, posted_time:postedTime, status, status_user:statusUser, request_subject:requestSubject, request_body:requestBody } = row
                        return {
                            rid,
                            uid,
                            postedTime,
                            status,
                            statusUser,
                            requestSubject,
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

adminRouter.get('/users/',
async (req,res) => {

    const uuid = req.body.uuid
    const {name,mobileNo,email,address,loksabha,assembly,panchayat,pincode} = req.body


    if (adminAuth(uuid)) {
    } else {
        return res.status(401).send({
            message: "Unauthorized!"
        })
    }

    var queryText = ` select * from users where mobile_no = $1 `
    var queryValues = [mobileNo]
    var valueIndex = 2
    
    const columnName = {
        name:"name",
        mobileNo: "mobile_no",
        email:"email",
        address:"address",
        loksabha:"loksabha",
        assembly:"assembly",
        panchayat:"panchayat",
        ward:"ward",
        pincode:"pincode"
    }
    
    for (const key in req.body) {
        if (key=="uuid") continue
        queryText += ` AND ${columnName[key]} = \$${valueIndex}`
        valueIndex+=1
        queryValues.push(req.body[key])
    }


    try {
        const result = await db.query(queryText,queryValues)

        if (result.rowCount==0) {
            return res.status(404).send({
                details: "User not found"
            })
        }
        const {name,mobile_no:mobileNo, email, address, loksabha, assembly, panchayat, ward, pincode, posted_time:postedTime} = result.rows[0]
        res.status(200).send({name,mobileNo, email, address, loksabha, assembly, panchayat, ward, pincode, postedTime})
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

//View details of a certain request

adminRouter.get('/requests/:rid',
validateRID,
async (req,res) => {

    const uuid = req.body.uuid
    const rid = req.params.rid
    const queryText = ` select name,loksabha,assembly,pincode,panchayat,mobile_no,email,ward,status,status_user,updated_time,posted_time,documents,request_body,request_subject,user_id from requests where r_id=$1`
    const queryValues = [rid]

    if (adminAuth(uuid)) {
    } else {
        return res.status(401).send({
            message: "Unauthorized!"
        })
    }

    try {

        const result = await db.query(queryText,queryValues)

        if (result.rowCount==0) {
            return res.status(404).send({
                details : "Request not found"
            })
        }
        const {name,loksabha,assembly,pincode,panchayat,mobile_no:mobileNo,email,address,ward,status,status_user:statusUser,updated_time:updatedTime,posted_time:postedTime,documents, request_body:requestBody, request_subject:requestSubject, user_id:uid} = result.rows[0]
        
        if (adminAuth(uuid)) {
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
            requestSubject
        }) } else {
            res.status(401).send({"message":"Unauthorized!"})
        }

    } catch (e) {
        console.log(e)
        return res.status(500).send()
    }
})

//change start number of request
adminRouter.patch('\requests\star_no',validateRID,async(req,res)=>{

    const {rid,star_no}=req.body
    const uuid=req.body.uuid
    const queryText='update requests set star=$1 where r_id=$2'
    const queryValues=[star_no,rid]

    if (adminAuth(uuid)) {

        if (!(rid in [0,1,2])){
            return res.status(500).send({
                message:"Invalid star number!"
            })
        }

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

    } else {
        return res.status(401).send({
            message: "Unauthorized!"
        })
    }

})

export default adminRouter