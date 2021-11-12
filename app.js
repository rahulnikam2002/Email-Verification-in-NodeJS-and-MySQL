const express = require('express');
const nodeMailer = require('nodemailer');
const mysql = require('mysql');

const app = express();
const port = 5000;

// database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'email-verification'
});


pool.getConnection((err, connection) => {
    if(err) throw err;
    console.log('Connected Successfully');
})

app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        success: 1,
        message: "You are on Home Page"
    })
})


app.post('/verify', (req, res) => {
    const { email } = req.body;

     const OTP = Math.floor(1000 + Math.random() * 9000);

    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'codewithrahulnikam@gmail.com',
            pass: 'rahulnikamwebdev@8767213959'
        }
    })

    let info = {
        from: `"Rahul Nikam" <codewithrahulnikam@gmail.com>`,
        to: `${email}`,
        subject: `Verification of is ${OTP}`,
        text: "",
        html: `${OTP}`
    }

    let sendEmail = transporter.sendMail(info, (err, success) => {
        if (err) {
            console.log(err);
            res.json({
                success: 0,
                message: err
            })
        }
        else {
            res.json({
                success: 1,
                message: `Email has been send on ${email}`,
                OTP: `${OTP}`
            })
        }
    })
})

app.get('/email', (req, res) => {
    res.json({
        success: 1,
        OTP: `${OTP}`
    })
})

app.listen(port, () => {
    console.log(`Server Started on ${port}`)
})