#= require active_admin/base
#= require carousel

ready = () ->
  childItems = (current_val) ->
    if current_val == ''
      $('input#translation_spanish_translation').hide()
      $( 'input#translation_russian_translation' ).hide()
      $( 'input#translation_korean_translation' ).hide()
      $( 'input#translation_japanese_translation' ).hide()
      $( 'input#translation_italian_translation' ).hide()
      $( 'input#translation_german_translation' ).hide()
      $( 'input#translation_french_translation' ).hide()
      $( 'input#translation_chinese_translation' ).hide()
      $( 'input#translation_english_translation' ).hide()
    else
      $('input#translation_spanish_translation').show()
      $( 'input#translation_russian_translation' ).show()
      $( 'input#translation_korean_translation' ).show()
      $( 'input#translation_japanese_translation' ).show()
      $( 'input#translation_italian_translation' ).show()
      $( 'input#translation_german_translation' ).show()
      $( 'input#translation_french_translation' ).show()
      $( 'input#translation_chinese_translation' ).show()
      $( 'input#translation_english_translation' ).show()

  $( 'select#translation_parent_id' ).change (e) ->
    el = $(this)
    val = el.val()
    childItems val

  $(".owl-carousel").owlCarousel({
    loop:true,
    center:true,
    nav: true,
  });

$(document).ready(ready)
$(document).on('page:load', ready)