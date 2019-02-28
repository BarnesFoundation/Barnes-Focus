ActiveAdmin.register Bookmark do
  permit_params :email, :image_id, :mail_sent, :created_at, :updated_at, :language, :session_id
  actions :all, except: [:new, :destroy, :edit]

  index do
    id_column
    column :email
    column :image_id
    column :mail_sent
    column :created_at
    column :updated_at
    column :language
    column :session_id
    actions
  end

  filter :email
  filter :image_id
  filter :mail_sent
  filter :created_at
  filter :updated_at
  filter :language
  filter :session_id

end
