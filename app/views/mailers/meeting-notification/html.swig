<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">

<head>
</head>

<body>
	<p>
		You have <strong>{{meeting.name}}</strong> meeting in project <strong>{{project.name}}</strong> today{% if !meeting.isAllDay %} at {{meeting.startDate}} {% endif%}.
	</p>
	{% if meeting.timebox %} <p>Timebox: {{meeting.timebox}}</p> {% endif%}
	<p>Type: {{meeting.type}}</p>
	<br>
	<p>Visit this url to join <strong>{{meeting.name}}</strong> meeting:</p>
	<p>{{url}}</p>
	<br>
	<br>
	<p>The HOPE Support Team</p>
</body>

</html>