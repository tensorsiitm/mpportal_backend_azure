import Joi from 'joi'

const statusConstraints = Joi.valid("DRAFT", "UNREAD", "READ", "PENDING", "COMPLETED")
const statusUserConstraints = Joi.valid("DRAFT", "PENDING", "COMPLETED")

const newRequestBodyConstraints = {

    //Personal Details

    name: Joi.string().min(5).max(100).regex(/^[\ \.\-a-zA-Z]+$/),

    email: Joi.string().email(),

    mobileNo: Joi.string().length(10), //number validation #TBD

    address: Joi.string(),

    loksabha:  Joi.string(),

    assembly: Joi.string(),

    panchayat: Joi.string(),

    ward: Joi.string(),

    pincode: Joi.number().integer(),


    date: Joi.string().regex(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/),

        //Request Details
    requestSubject:Joi.string(),

    requestCategory:Joi.string(),

    requestBody:Joi.string(),


    status: statusConstraints,

    statusUser: statusUserConstraints,

    date: Joi.string().isoDate(),

    documents: Joi.array().items(Joi.string()),

        //Action Details

    actionSubject: Joi.string(),

    actionBody: Joi.string(),
    
    actionReply: Joi.string()

   
}

export const validator = (reqKeys, optKeys) => {
    return function(req, res, next){

        let constraint = {
            uuid: Joi.string().optional()
        }

        for(const index in reqKeys){
            const key = reqKeys[index]
            constraint[key] = newRequestBodyConstraints[key].required()
        }

        for(const index in optKeys){
            const key = optKeys[index]
            constraint[key] = newRequestBodyConstraints[key]
        }

        const {value, error} = Joi.object(constraint).validate(req.body)

        if (error) {
            console.log("here")
            return res.status(400).send(error.message)
        }

        next()
    }
}

export const validateRID = (req, res, next) => {
    const {error} = Joi.number().integer().min(15975327).validate(req.params.rid)
    if (error) return res.status(400).send(error.message)
    next()
}



export const validateAID = (req, res, next) => {
    const {error} = Joi.number().integer().min(0).validate(req.params.aid)
    if (error) return res.status(400).send(error.message)
    next()
}