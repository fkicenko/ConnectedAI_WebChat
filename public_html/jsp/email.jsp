<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="java.io.*,java.util.*,javax.mail.*"%>
<%@ page import="javax.mail.internet.*,javax.activation.*"%>
<%@ page import="javax.servlet.http.*,javax.servlet.*" %>
<%
String result;
// Recipient's email ID needs to be mentioned.
boolean sessionDebug = true;
String to = "info@cc.com";
// Sender's email ID needs to be mentioned
String from = request.getParameter("email");

// Assuming you are sending email from 10.57.16.8
String host = "ad.cc.com";
String subject = request.getParameter("subject");
String messageText = request.getParameter("text");

Properties props = System.getProperties();
props.put("mail.host", host);
props.put("mail.transport.protocol.", "smtp");
props.put("mail.smtp.auth", "false");
props.put("mail.smtp.", "true");
props.put("mail.smtp.port", "25");
props.put("mail.smtp.socketFactory.fallback", "false");
//props.put("mail.smtp.socketFactory.class", SSL_FACTORY);


 Session mailSession = Session.getDefaultInstance(props, null);
 mailSession.setDebug(sessionDebug);


 Message msg = new MimeMessage(mailSession);
 msg.setFrom(new InternetAddress(from));
 InternetAddress[] address = {new InternetAddress(to)};
 msg.setRecipients(Message.RecipientType.TO, address);
 msg.setSubject(subject);
 msg.setContent(messageText, "text/html"); // use setText if you want to send text


Transport transport = mailSession.getTransport("smtp");
Transport.send(msg);


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<meta http-equiv="refresh" content ="1; url=/CumulusFinance/contact-us.html">
<title>Cumulus Email Support</title>
</head>
<body>
<script>alert("Email has been sent!"); </script>
</body>
</html>