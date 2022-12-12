import express from 'express'
import db from '../db/postgres.js'
import {validator, validateRID, validateAID} from '../utils/validator.js'
import getISTDate from '../utils/getISTDate.js'

const newActionRouter = express.Router()

// Add a new action for a request
newActionRouter.post('/:rid',
validateRID,
validator(['actionSubject','actionBody'],[]),
async (req,res) => {
    const rid = req.params.rid
    const {actionSubject,actionBody} = req.body

    const postedTime = new getISTDate().toISOString()

    var queryText = `
    insert into actions(action_subject,action_body,r_id,posted_time,updated_time,act_no)
    values ($1,$2,$3,'${postedTime}','${postedTime}',$4)`
    const queryValues = [actionSubject,actionBody,rid]

    var getActionNumberText = `select act_no from actions where r_id = '${rid}'`
    const actionQueryValues=[]

    var client
    try {
         client = await db.connect()

         const getActionNo = await client.query(getActionNumberText,actionQueryValues)

         const actionNo = getActionNo.rowCount + 1
         queryValues.push(actionNo)

         await client.query(queryText,queryValues)
         res.status(201).send()
    } catch (e) {
        console.log(e)
        res.status(500).send()
    } finally {
        if (client) client.release()
    }
})

// Update an action for a request
newActionRouter.patch('/:aid',
validateAID,
validator([],['actionSubject','actionBody','actionReply']),
async (req,res) => {

    const updatedTime = new getISTDate().toISOString()

    const {actionSubject,actionBody,actionReply} = req.body

    var queryText = `update actions set updated_time='${updatedTime}'`
    var queryValues = [req.params.aid]
    valueIndex = 2

    const columnName = {
        actionSubject:"action_subject",
        actionBody:"action_body",
        actionReply:"action_reply"
    }

    for (const key in req.body) {
        if (key==="uuid") continue
        queryText += `,${columnName[key]} =\$${valueIndex}`
        valueIndex +=1
        queryValues.push(req.body[key])
    }

    queryText += `where a_id = $1`

    var client
    try {
        client = await db.connect()

        const result = await client.query(queryText,queryValues)
        
        if(result.rowCount==0) {
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


// Show all actions for a request
newActionRouter.get('/:rid',
validateRID,
async (req,res) => {
    const rid = req.params.rid
    const queryText = ` select * from actions where r_id = $1`
    const queryValues = [rid]

    try {
        const result = await db.query(queryText,queryValues)

        res.status(200).send(
            {
                details : Array.from(
                    result.rows,
                    (row) => {
                        const {a_id:aid,act_no:actionNo, action_subject:actionSubject, action_body:actionBody, action_reply:actionReply} = row
                        return {
                            aid,
                            actionNo,
                            actionSubject,
                            actionBody,
                            actionReply
                        }
                    }
                )
            }
        )
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

newActionRouter.delete('/:aid',
validateAID,
async (req,res) => {


    var moveQueryText = `insert into del_actions (posted_time,updated_time,action_subject,action_body,action_reply,act_no,a_id,r_id)
    select posted_time::timestamp, updated_time::timestamp, action_subject,action_body,action_reply, act_no,a_id,r_id from actions where a_id = $1`
    var queryText= `delete from actions where a_id =$1`
    var queryValues=[req.params.aid]
    var client
    try {
        client = await db.connect()
        await client.query(moveQueryText,queryValues)
        await client.query(queryText,queryValues)
        res.status(204).send()
    } catch (e) {
        console.log(e)
        res.status(500).send()
    } finally {
        if (client) client.release()
    }
})

export default newActionRouter