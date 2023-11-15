<?php

function send_mail($to, $subject, $message) {

    $headers = "Content-Type: text/html; charset=UTF-8\r\n";


    return mail($to, $subject, $message, $headers);
}

if (isset($_POST) && !empty($_POST) && array_key_exists('quiz', $_POST)) {
  
    $message = '';
    $message .= array_key_exists('name', $_POST['quiz']) ? '<strong>Имя:</strong> ' . $_POST['quiz']['name'] : '';
    $message .= array_key_exists('phone', $_POST['quiz']) ? '<br><strong>Телефон:</strong> ' . $_POST['quiz']['phone'] : '';
    $message .= array_key_exists('message', $_POST['quiz']) ? '<br><strong>Удобный способ связи</strong> ' . $_POST['quiz']['message'] : '';
    $message .= array_key_exists('type', $_POST['quiz']) ? '<br><strong>Что хотите украсить:</strong> ' . $_POST['quiz']['type'] : '';   
    $message .= array_key_exists('place', $_POST['quiz']) ? '<br><strong>Местоположение:</strong> ' . $_POST['quiz']['place'] : '';
      
    
    
    send_mail('kachessovao@gmail.com', 'Новый квиз!', $message);
    
    $json = ['vid' => $_POST['quiz']['type'], 
    'adress' => $_POST['quiz']['place'],
    'name' => $_POST['quiz']['name'],
    'phone' => $_POST['quiz']['phone'],
    'email' => $_POST['quiz']['message']
    ];
    
    $url = 'https://b2b.rocketcrm.bz/api/channels/site/form?hash=56c5a9be6a';
   
    $encodedJson = json_encode($json);
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt( $curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $encodedJson);
    $result = curl_exec($curl);
    curl_close($curl);
    
    $file = 'log.txt';
    // Write the contents back to the file
    file_put_contents($file, $result, FILE_APPEND | LOCK_EX);

    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    die();
}