class Api::BaseController < ApplicationController
  protect_from_forgery with: :null_session

private
  def capture_scanned_history image_id
    if session[ :user_scanned_history ].present?
      user_scanned_history = JSON.parse session[ :user_scanned_history ]
      user_scanned_history.push image_id
      user_scanned_history = JSON.generate( user_scanned_history )
      session[ :user_scanned_history ] = user_scanned_history
    else
      session[ :user_scanned_history ] = JSON.generate( [image_id] )
    end
    validate_bookmark_entry image_id
  end

  def validate_bookmark_entry image_id
    session = ActiveRecord::SessionStore::Session.find_by_session_id( request.session_options[:id] )
    bookmark = Bookmark.new( session_id: session.id, image_id: image_id )
    bookmark_with_email = Bookmark.where( session_id: session.id ).where.not( email: nil ).first

    bookmark.email = bookmark_with_email.email if bookmark_with_email.present?
    bookmark.save
  end
end