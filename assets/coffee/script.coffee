$('#form-maker').on 'submit', () ->
	event.preventDefault()
	$("header").hide()
	$("#form-maker").hide()
	$("#section-out").show()

	$.ajax('/create', { data: $(this).serialize(), dataType: "json" })
	.done (data) ->
		if data.result is "error"
			$("header").show()
			$("#form-maker").show()
			$("#section-out").hide()
			return alert data.msg

		if data.result is "success"
			$("#section-out").html("<img src='/out/#{data.id}.gif'>")
	.fail (data) ->
		$("header").show()
		$("#form-maker").show()
		$("#section-out").hide()