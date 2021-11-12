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
    if (err) throw err;
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
            pool.getConnection((err, connection) => {
                if (err) throw err;
                console.log('Connected Successfully');
                connection.query('UPDATE users SET otp = ? WHERE email = ?', [OTP, email], (err, successful) => {
                    if (err) {
                        res.json({
                            success: 0,
                            code: 'in Database connection',
                            message: err
                        })
                    }
                    else {
                        res.json({
                            success: 1,
                            message: `Email has been send on ${email}`,
                            OTP: `${OTP}`
                        })


                        // Redirect/Render USER => http://lcoalhost:5000/verify?email_id=codewithrahulnkam@gmail.com
                    }
                })

            })
        }
    })
})

app.get('/email', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT otp FROM users WHERE email = ?', [req.query.email], (err, userOTP) => {
            if (err) {
                res.json({
                    success: 0,
                    code: 'Fetching Database connection',
                    message: err
                })
            }
            else {
                console.log(userOTP)
                res.json({
                    success: 1,
                    // message: 'Email verified successfully',
                    OTP: userOTP
                })
            }
        })
    })
})

app.post('/email', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT otp FROM users WHERE email = ?', [req.query.email], (err, userOTP) => {
            if (err) {
                res.json({
                    success: 0,
                    code: 'Fetching Database connection',
                    message: err
                })
            }
            else {
                let originalOTP = userOTP[0].otp;
                let userEnteredOTP = req.body.otp;
                if (userEnteredOTP == originalOTP) {
                    connection.query('UPDATE users SET emailStatus = "verified" WHERE email = ?', [req.query.email], (err, successful) => {
                        if (err) throw err;

                        res.json({
                            success: 1,
                            message: 'Email verified successfully',
                            OTP: userOTP
                        })
                    })
                }
                else {
                    res.json({
                        success: 1,
                        message: 'Incorrect OTP',
                        OTP: userOTP
                    })
                }
            }
        })
    })
})

app.listen(port, () => {
    console.log(`Server Started on ${port}`)
})