/**
 * Created by Aureliano on 17/11/2015.
 * Service for sending mail with SENDGRID
 * TODO: REPLACE mail service with sendgrid mail service
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'MailService';
var MailSender = require('sendgrid')(process.env.SG_APIUSER, process.env.SG_APIPWD);

/**
 * send a email
 * @param fromEmail
 * @param fromName
 * @param subject
 * @param body
 * @param toEmail
 * @param onSendOk
 * @private
 */
function _sendEmail(fromEmail, fromName, ccEmail, replyToEmail, subject, body, toEmail, onSendOk) {

  if (process.env.enviroment == 'development' && process.env.SKIPAUTH == true) {
    ccEmail = 'fake@digitalx.it';
  }

  var emailData = {
    from: fromEmail,
    fromname: fromName,
    subject: subject,
    html: body,
    to: toEmail,
    cc: ccEmail,
    replyto: replyToEmail
  };

  _getMailSender().send(
    emailData,
    function onSend(err, json) {
      if (err) {
        console.log(MODULE_NAME + ': mail error ' + subject);
        console.error(err);
      } else {
        console.log(MODULE_NAME + ': mail sended ' + subject);
      }
      onSendOk(err, json);
    }
  )

}

/**
 * return the mail service
 * @private
 */
function _getMailSender() {
  if (!MailSender) {
    MailSender = require('sendgrid')(process.env.SG_APIUSER, process.env.SG_APIPWD);
  }
  return MailSender;
}


/** Exports */
exports.sendEmail = _sendEmail;