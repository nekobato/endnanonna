$('#form-maker').on 'submit', () ->
	event.preventDefault()
	$("header").hide()
	$("#form-maker").hide()
	$("#section-out").show()

	$.ajax('/create', { data: $(this).serialize(), dataType: "text" })
	.done (data) ->
		$("#section-out").html("<img src='/out/#{data}.gif'>")
	.fail (data) ->
		$("header").show()
		$("#form-maker").show()
		$("#section-out").hide()
		return alert(data)
