document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#form-maker').addEventListener('submit', function(e) {
    e.preventDefault();

    $('header').hide();
    $('#form-maker').hide();
    $('#section-out').show();

    $.get('/create', {
      string: document.querySelector('input[name="string"]').value
    })
      .done(function(data) {
        return $('#section-out').html(`<img src="/out/${data}.gif">`);
      })
      .fail(function(res) {
        $('header').show();
        $('#form-maker').show();
        $('#section-out').hide();
        return alert(res.responseText);
      });
  });
});
