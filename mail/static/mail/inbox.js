document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');

  // Send mail
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    });
    load_mailbox('sent');
    return false;
  }
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Mailbox
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    //Print emails
    console.log(emails);

    emails.forEach(email => {

      const element = document.createElement('div');
      if (email.read) {
        element.className = 'email-read';
      } else {
        element.className = 'email';
      }
      element.innerHTML = '<span class="email-sender">' + email.sender + '</span><span class="email-subject">' + email.subject + '</span><span class="email-timestamp">' + email.timestamp + '</span>';
      element.addEventListener('click', () => {
        fetch('/emails/' + email.id, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        view_email(email.id, mailbox);
      });
      document.querySelector('#emails-view').append(element);
    });
  });
}

function view_email(email_id, mailbox) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  document.querySelector('#email-view').innerHTML = '';

  // View email
  fetch('/emails/' + email_id)
  .then(response => response.json())
  .then(email => {

    // Print email
    console.log(email);

    const header = document.createElement('div');
    header.innerHTML = '<p><span class="font-weight-bold">From: </span>' + email.sender + '</p><p><span class="font-weight-bold">To: </span>' + email.recipients + '</p><p><span class="font-weight-bold">Subject: </span>' + email.subject + '</p><p><span class="font-weight-bold">Timestamp: </span>' + email.timestamp + '</p>';
    document.querySelector('#email-view').append(header);
    if (mailbox === 'inbox') {
      const archive = document.createElement('button');
      archive.className = 'btn btn-sm btn-outline-primary mr-1';
      archive.id = 'archive';
      archive.innerHTML = 'Archive';
      document.querySelector('#email-view').append(archive);
      
      // Archive
      document.querySelector('#archive').onclick = () => {
        fetch('/emails/' + email_id, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
        load_mailbox('inbox');
      }
    } else if (mailbox === 'archive') {
      const unarchive = document.createElement('button');
      unarchive.className = 'btn btn-sm btn-outline-primary mr-1';
      unarchive.id = 'unarchive';
      unarchive.innerHTML = 'Unarchive';
      document.querySelector('#email-view').append(unarchive);

      // Unarchive
      document.querySelector('#unarchive').onclick = () => {
        fetch('/emails/' + email_id, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
        load_mailbox('inbox');
      }
    }
    const reply = document.createElement('button');
    reply.className = 'btn btn-sm btn-outline-primary mr-1';
    reply.id = 'reply';
    reply.innerHTML = 'Reply';
    document.querySelector('#email-view').append(reply);

    // Reply
    document.querySelector('#reply').onclick = () => {

      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#email-view').style.display = 'none';

      // Pre-fill composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      if (email.subject.substring(0, 4) === 'Re: ') {
        document.querySelector('#compose-subject').value = email.subject;
      } else {
        document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
      }
      document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote:' + email.body;
    }

    const body = document.createElement('div');
    body.innerHTML = '<hr>' + email.body;
    document.querySelector('#email-view').append(body);
  })
  return false;
}