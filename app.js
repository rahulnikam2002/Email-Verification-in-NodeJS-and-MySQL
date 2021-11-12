const express = require('express');
const nodeMailer = require('nodemailer');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const bodyParser = require('body-parser');

require('dotenv').config()

const app = express();
const port = 5000;


// Telling our backend that the static files of our website are going to be in which folder!!
app.use(express.static('public'));

//Template Engines 
app.engine("hbs", exphbs({ extname: '.hbs' }))
app.set('view engine', 'hbs');



app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());

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
    res.render('home')
})


app.get('/v1/auth/verify/email', (req, res) => {
    const { userEmail_id } = req.query;

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
        to: `${userEmail_id}`,
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
                connection.query('UPDATE users SET otp = ? WHERE email = ?', [OTP, userEmail_id], (err, successful) => {
                    if (err) {
                        res.json({
                            success: 0,
                            code: 'in Database connection',
                            message: err
                        })
                    }
                    else {
                        // res.json({
                        //     success: 1,
                        //     message: `Email has been send on ${userEmail_id}`,
                        //     OTP: `${OTP}`
                        // })
                        // res.redirect(`/v1/verify/email/confirm-email/opt?email=${userEmail_id}`)
                        res.render('verifypage', {userEmail: userEmail_id})

                        // Redirect/Render USER => http://lcoalhost:5000/verify?email_id=codewithrahulnkam@gmail.com
                    }
                })

            })
        }
    })
})

app.get('/v1/verify/email/confirm-email/opt', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT otp FROM users WHERE email = ?', [req.query.userEmail_id], (err, userOTP) => {
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

app.post('/v1/verify/email/otp/:userEmail', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT otp FROM users WHERE email = ?', [req.params.userEmail], (err, userOTP) => {
            if (err) {
                res.json({
                    success: 0,
                    code: 'Fetching Database connection',
                    message: err
                })
            }
            else {
                let originalOTP = userOTP[0].otp;
                let userEnteredOTP = req.body.userOTP;
                console.log(userEnteredOTP)
                if (userEnteredOTP == originalOTP) {
                    connection.query('UPDATE users SET emailStatus = "verified" WHERE email = ?', [req.params.userEmail], (err, successful) => {
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