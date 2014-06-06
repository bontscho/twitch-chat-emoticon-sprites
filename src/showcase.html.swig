<html>
 <head>
 <title>Twitch-Chat-Emoticons</title>
 <link rel="stylesheet" type="text/css" href="assets/stylesheets/twitch-emoticons.css">
 <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
 <style type="text/css">
    html, body, td {
        font-family: "Open Sans";
        font-size: 13px;
    }
 </style>
 </head>

 <body>
    <h1>Twitch Chat Emoticons Showcase</h1>

    <table>
        <thead>
            <tr>
                <th>Stylesheet</th>
                <th>Classname</th>
            </tr>
        </thead>

        <tbody>
            {% for icon in icons %}
            <tr>
                <td><i class="twitch {{ icon }}"></td>
                <td>{{ icon }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
 </body>
</html>