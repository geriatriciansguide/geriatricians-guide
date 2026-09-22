/* Email validation for every .email-form on the site.
   Runs in the capture phase so it fires before each page's own submit handler
   and can stop a bad address before it ever reaches Kit. */
(function () {
  var DISPOSABLE = ['mailinator.com','guerrillamail.com','guerrillamail.net','sharklasers.com','10minutemail.com','10minutemail.net','tempmail.com','temp-mail.org','tempmail.net','yopmail.com','trashmail.com','throwawaymail.com','getnada.com','nada.email','dispostable.com','maildrop.cc','fakeinbox.com','mailnesia.com','spamgourmet.com','discard.email','emailondeck.com','moakt.com','tempr.email','mintemail.com','inboxbear.com','mail7.io','byom.de','grr.la','spam4.me','trbvm.com','mailcatch.com','tmpmail.org','burnermail.io','mohmal.com','anonaddy.me','einrot.com','tempmailo.com'];
  var RESERVED = ['example.com','example.org','example.net','test.com','test.org','email.com','domain.com','mail.com','yourdomain.com','abc.com','asdf.com','none.com','no.com'];
  var TYPOS = {'gmial.com':'gmail.com','gmai.com':'gmail.com','gmail.co':'gmail.com','gmail.con':'gmail.com','gmail.cm':'gmail.com','gnail.com':'gmail.com','gmaill.com':'gmail.com','gamil.com':'gmail.com','hotmial.com':'hotmail.com','hotmai.com':'hotmail.com','hotmail.co':'hotmail.com','hotmail.con':'hotmail.com','yaho.com':'yahoo.com','yahooo.com':'yahoo.com','yahoo.co':'yahoo.com','yahoo.con':'yahoo.com','outlok.com':'outlook.com','outlook.co':'outlook.com','outlook.con':'outlook.com','icloud.co':'icloud.com','iclould.com':'icloud.com','comcast.ent':'comcast.net','aol.co':'aol.com','me.co':'me.com'};
  /* One @, a local part, a dotted domain, and a 2+ letter TLD. No stray dots. */
  var RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

  function msgEl(form) {
    var el = form.nextElementSibling;
    if (el && el.classList && el.classList.contains('email-form__error')) return el;
    el = document.createElement('p');
    el.className = 'email-form__error';
    el.setAttribute('role', 'alert');
    form.parentNode.insertBefore(el, form.nextSibling);
    return el;
  }
  function show(form, text) { var el = msgEl(form); el.textContent = text; el.classList.add('is-visible'); }
  function clear(form) {
    var el = form.nextElementSibling;
    if (el && el.classList && el.classList.contains('email-form__error')) { el.textContent = ''; el.classList.remove('is-visible'); }
  }
  function block(e, form, input, text) {
    e.preventDefault(); e.stopImmediatePropagation();
    show(form, text);
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.classList || !form.classList.contains('email-form')) return;
    var input = form.querySelector('input[type="email"]');
    if (!input) return;

    var value = input.value.trim().replace(/\s+/g, '');
    input.value = value;
    var domain = (value.split('@')[1] || '').toLowerCase();

    if (!value) return block(e, form, input, 'Enter your email address.');
    if (!RE.test(value) || value.length > 254) return block(e, form, input, 'That does not look like a complete email address. Check for a missing @ or a missing .com.');
    if (RESERVED.indexOf(domain) > -1) return block(e, form, input, 'Use a real email address — that one will not receive anything.');
    if (DISPOSABLE.indexOf(domain) > -1) return block(e, form, input, 'Temporary email addresses cannot receive the download. Use an address you check.');

    /* A likely typo warns once, then lets the second submit through. */
    if (TYPOS[domain] && !form.dataset.typoWarned) {
      form.dataset.typoWarned = '1';
      return block(e, form, input, 'Did you mean ' + value.split('@')[0] + '@' + TYPOS[domain] + '? Correct it, or submit again to use what you typed.');
    }

    input.removeAttribute('aria-invalid');
    clear(form);
  }, true);

  document.addEventListener('input', function (e) {
    var input = e.target;
    if (input && input.type === 'email' && input.form && input.form.classList.contains('email-form')) {
      input.removeAttribute('aria-invalid');
      clear(input.form);
    }
  }, true);
})();
