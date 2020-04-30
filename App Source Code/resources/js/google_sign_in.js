

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var userId = profile.getId();
  var userName = profile.getName();
  var email =profile.getEmail();

  var id_token = googleUser.getAuthResponse().id_token;
  $.post(window.location.origin+'/signIn', {token: id_token});

  document.getElementById('GoogleSignIn').style.display='none';
  document.getElementById('GoogleSignOut').style.display='block';

}

function onOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		$.post(window.location.origin+'/signOut');
	});
  document.getElementById('GoogleSignIn').style.display='block';
  document.getElementById('GoogleSignOut').style.display='none';

}

