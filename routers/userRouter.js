import express from 'express'
import db from '../db/postgres.js'
import {validator} from '../utils/validator.js'
import { FBAuth } from '../utils/authenticate.js';
import getISTDate from '../utils/getISTDate.js';

const userRouter = express.Router()

//Add new user
userRouter.post('/new',FBAuth,
validator(['name','mobileNo'],['email','address','loksabha','assembly','panchayat','ward','pincode']),
async (req,res) => {

    const uuid=req.body.uuid
    const {name,mobileNo} = req.body
    const postedTime = new getISTDate().toISOString()

    var firstHalf = `insert into users(user_id,name,mobile_no,posted_time`
    var secondHalf = `values($1,$2,$3,$4`
    var queryValues=[uuid,name,mobileNo,postedTime]
    var valueIndex=5

    const columnName = {
        pincode:'pincode',
        panchayat:'panchayat',
        address:'address',
        loksabha:'loksabha',
        assembly:'assembly',
        ward:'ward',
        email:'email'   
    }

    for (key in req.body) {
        if (key=='name' || key=='mobileNo' || key=='uuid') continue
        firstHalf += `, ${columnName[key]}`
        secondHalf += `,\$${valueIndex}`
        queryValues.push(req.body[key])
        valueIndex +=1
    }
    queryText = firstHalf +`)` + secondHalf + `)`

    try {
        const result = await db.query(queryText,queryValues)

        return res.status(200).send({
            details: "User Signed Up!"
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send()
    }

} )
//Get user info

userRouter.get('/',FBAuth,
async (req,res) => {

    const uuid = req.body.uuid
    const queryText = ` select * from users where user_id = $1`
    const queryValues = [uuid]

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
//update user info

userRouter.patch('/',FBAuth,
validator([],['name','mobileNo','email','address','panchayat','ward','pincode','loksabha','assembly']),
async (req,res) => {

    const postedTime = new getISTDate().toISOString()

    const uuid = req.body.uuid

    var queryText =`update users set posted_time = '${postedTime}'`
    var queryValues = [uuid]
    var valueIndex=2
    

    const columnName = {
        uid : "user_id",
        name:"name",
        mobileNo: "mobile_no",
        email:"email",
        address:"address",
        panchayat:"panchayat",
        ward:"ward",
        pincode:"pincode",
        loksabha:"loksabha",
        assembly:"assembly"
    }
    
    for (const key in req.body) {
        if (key==="uuid") continue
        queryText += `, ${columnName[key]} = \$${valueIndex}`
        valueIndex +=1
        queryValues.push(req.body[key])
    }
    
    

    queryText += ` where user_id = $1;`

    var client
    try {
        client = await db.connect()

        // Should I put a userAuth to check if uid is present?

        await client.query(queryText,queryValues)
        res.status(204).send()

    } catch (e) {
        console.log(e)
        res.status(500).send()
    } finally {
        if (client) client.release()
    }

})

//delete a user

userRouter.delete('/', FBAuth,
async (req,res) => {
    const uuid = req.body.uuid

    const moveQueryText = `insert into del_users (user_id,name,mobile_no,email,address,loksabha,assembly,panchayat,ward,pincode,posted_time)
     select * from users where user_id = $1`
    const queryText = `delete from users where user_id = $1`
    const queryValues = [uuid]



    var client

    try {
        client = await db.connect()

        // Should I put a userAuth to check if uid is present?

        await client.query('BEGIN')

        await client.query(moveQueryText,queryValues)
        await client.query(queryText,queryValues)

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

export default userRouter