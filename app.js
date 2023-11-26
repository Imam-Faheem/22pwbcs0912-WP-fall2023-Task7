const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;


// Express middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML page on /emails route
app.get('/emails', (req, res) => {
    fs.readFile('emails.txt', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading emails.txt');
            console.error(err, "error");
        } else {
            res.send(data);
            console.log(data, "Serving HTML page on /emails route");
        }
    });
});

// Serve email details on /email-details route
app.get('/email-details', (req, res) => {
    fs.readFile('email-details.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading email-details.json');
            console.error(err, "error");
        } else {
            res.json(JSON.parse(data));
            console.log(data, "Email details sent");
        }
    });
});

// Send email on /send-email route
app.get('/send-email', (req, res) => {
    // Check if 'emails.txt' exists
    fs.access('emails.txt', fs.constants.F_OK, (accessErr) => {
        if (accessErr) {
            res.status(500).send('File "emails.txt" does not exist');
        } else {
            // File exists, proceed with reading and sending email
            fs.readFile('./emails.txt', 'utf8', (readErr, data) => {
                if (readErr) {
                    res.status(500).send('Error reading emails.txt');
                } else {
                    // Read email details from a JSON file
                    fs.readFile('./email-details.json', 'utf8', (detailsErr, details) => {
                        if (detailsErr) {
                            res.status(500).send('Error reading email-details.json');
                        } else {
                            // Parse email details
                            const emailDetails = JSON.parse(details);

                            // Configure nodemailer
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: emailDetails.from,
                                    pass: emailDetails.fromPassword
                                }
                            });

                            const mailOptions = {
                                from: emailDetails.from,
                                to: emailDetails.to,
                                subject: 'Subject is to Read data from the Text file',
                                text: data
                            };

                            // Send email
                            transporter.sendMail(mailOptions, (sendErr, info) => {
                                if (sendErr) {
                                    console.error('Error sending email:', sendErr);
                                    res.status(500).send(`Error sending email: ${sendErr.message}`);
                                } else {
                                    console.log('Email sent:', info);
                                    res.send('Email sent successfully');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// Serve HTML page on root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
