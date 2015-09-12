<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">

<head>
</head>

<body>
  <p></p>
  {% if messages.length === 1 %}
    <p>{{user.displayName}} ({{user.email.toString()}}) <b>"{{messages[0]}}"</b> ({{ tbl|capitalize }} - {{ tbl_id }}) at </p>
    <p>At {{created.toString()}}</p>
    <p>IP address: {{last_ip_at}}</p>
  {% else %}
    <p>{{user.displayName}} ({{user.email.toString()}}) <b>"{{messages[0]}}"</b> ({{ tbl|capitalize }} - {{ tbl_id }})</p>
    <p>At {{created.toString()}}</p>
    <p>IP address: {{last_ip_at}}</p>
    <p>with changes:</p>

    </br>
    <ol>
    {% for x in messages %}
      {% if !loop.first %}
        <li>{{x}}</li>
      {% endif %}
    {% endfor %}
    </ol>
  {% endif %}
  <br>
  <p>The HOPE Support Team</p>
</body>

</html>