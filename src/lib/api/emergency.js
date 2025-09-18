import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_ID = process.env.EMAIL_ID;
const REDIRECT_URL = "https://developers.google.com/oauthplayground";

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL,
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      timestamp,
      userInfo,
      emergencyContacts,
      location,
      severity,
      message,
    } = req.body;

    // Validate required fields
    if (!userInfo || !emergencyContacts || !message) {
      return res.status(400).json({
        error: "Missing required fields: userInfo, emergencyContacts, message",
      });
    }

    // Configure email transporter (using Gmail as example)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Create emergency email content
    const emailSubject = `🚨 EMERGENCY ALERT - ${severity} Priority - ${userInfo.name}`;

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .emergency-container {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fee;
            border: 3px solid #dc2626;
            border-radius: 8px;
            overflow: hidden;
          }
          .emergency-header {
            background-color: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .emergency-body {
            padding: 20px;
          }
          .info-row {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #fef2f2;
            border-radius: 4px;
          }
          .label {
            font-weight: bold;
            color: #7f1d1d;
          }
          .timestamp {
            background-color: #ffedd5;
            color: #9a3412;
            padding: 10px;
            text-align: center;
            font-size: 14px;
          }
          .action-required {
            background-color: #fbbf24;
            color: #78350f;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="emergency-container">
          <div class="emergency-header">
            <h1>🚨 EMERGENCY ALERT 🚨</h1>
            <h2>IMMEDIATE ASSISTANCE REQUIRED</h2>
          </div>
          
          <div class="emergency-body">
            <div class="action-required">
              PRIORITY: ${severity} - RESPOND IMMEDIATELY
            </div>
            
            <div class="info-row">
              <span class="label">Emergency Message:</span><br>
              ${message}
            </div>
            
            <div class="info-row">
              <span class="label">Person in Emergency:</span><br>
              ${userInfo.name}
            </div>
            
            <div class="info-row">
              <span class="label">Contact Phone:</span><br>
              ${userInfo.phone || "Not provided"}
            </div>
            
            <div class="info-row">
              <span class="label">Location:</span><br>
              ${location || "Location not specified"}
            </div>
            
            <div class="info-row">
              <span class="label">Alert Triggered:</span><br>
              ${new Date(timestamp).toLocaleString()}
            </div>
          </div>
          
          <div class="timestamp">
            This is an automated emergency alert. Please respond immediately.
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      🚨 EMERGENCY ALERT 🚨
      IMMEDIATE ASSISTANCE REQUIRED
      
      Priority: ${severity}
      Person: ${userInfo.name}
      Phone: ${userInfo.phone || "Not provided"}
      Location: ${location || "Not specified"}
      Time: ${new Date(timestamp).toLocaleString()}
      
      Message: ${message}
      
      This is an automated emergency alert. Please respond immediately.
    `;

    // Send emails to all emergency contacts
    const emailPromises = emergencyContacts.map(async (contact) => {
      try {
        const info = await transporter.sendMail({
          from: `"Emergency Alert System" <${process.env.EMAIL_USER}>`,
          to: contact,
          subject: emailSubject,
          text: emailText,
          html: emailHTML,
          priority: "high",
          headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            Importance: "high",
          },
        });

        return {
          contact,
          success: true,
          messageId: info.messageId,
        };
      } catch (error) {
        console.error(`Failed to send email to ${contact}:`, error);
        return {
          contact,
          success: false,
          error: error.message,
        };
      }
    });

    // Wait for all emails to be processed
    const results = await Promise.all(emailPromises);

    // Check if any emails were sent successfully
    const successfulEmails = results.filter((r) => r.success);
    const failedEmails = results.filter((r) => !r.success);

    // Log the emergency event (you might want to save this to a database)
    console.log("EMERGENCY ALERT TRIGGERED:", {
      timestamp,
      user: userInfo.name,
      location,
      contactsNotified: successfulEmails.length,
      contactsFailed: failedEmails.length,
    });

    // Prepare response
    const response = {
      success: successfulEmails.length > 0,
      timestamp,
      emailsSent: successfulEmails.length,
      emailsFailed: failedEmails.length,
      totalContacts: emergencyContacts.length,
      results: results,
    };

    if (successfulEmails.length === 0) {
      return res.status(500).json({
        ...response,
        error: "Failed to send emergency alert to any contacts",
      });
    }

    if (failedEmails.length > 0) {
      return res.status(207).json({
        ...response,
        warning: `Failed to notify ${failedEmails.length} out of ${emergencyContacts.length} contacts`,
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Emergency alert system error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
