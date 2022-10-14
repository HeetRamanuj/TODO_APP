const jwt = require('jsonwebtoken')

const config = process.env;

const verifyToken = (req, res, next) => {

    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    console.log(token)

    if (!token) {

        return res.status(403).send("A token is require for authentication")

    }

    try {

        console.log("try === ", token);

        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user_id = decoded;

        console.log("\n END \n")

    } catch (error) {

        return res.status(401).send("AUTH: -Invalid Token ")

    }

    return next()

}

module.exports = verifyToken;