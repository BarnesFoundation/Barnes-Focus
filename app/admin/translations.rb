ActiveAdmin.register Translation do
  actions :all, except: [:new, :destroy]

  config.filters = false
  config.per_page = 50
  config.sort_order = 'id_asc'
  config.action_items.delete_if { |item| item.display_on?(:show) }

  scope :all_parents, default: true

  permit_params :parent_id, :screen_text, :english_translation, :chinese_translation, :french_translation, :german_translation, :italian_translation,
    :japanese_translation, :korean_translation, :russian_translation, :spanish_translation

  index as: :table do
    selectable_column
    column "Page", :screen_text
    column :created_at
    column :updated_at
    column "" do |resource|
      link_to 'View', resource_path(resource), :class => "member_link edit_link"
    end
  end

  form do |f|
    f.semantic_errors # shows errors on :base
    f.inputs do
      unless f.object.new_record?
        f.input :parent_id, label: 'Sub text of', as: :select,
          collection: Translation.all_parents.all.map{ |t| [ t.screen_text, t.id ] }, prompt: 'Choose the screen', input_html: { disabled: true }
      end
      f.input :screen_text, input_html: { class: 'autogrow', rows: 10 }
      f.input :english_translation, input_html: { class: 'autogrow', rows: 10 }
      f.input :chinese_translation, label: "Chinese Translation<br />(中文)".html_safe, input_html: { class: 'autogrow', rows: 10 }
      f.input :french_translation, label: "French Translation<br />(Français)".html_safe, input_html: { class: 'autogrow', rows: 10 }
      f.input :german_translation, label: "German Translation<br />(Deutsch)".html_safe, input_html: { class: 'autogrow', rows: 10 }
      f.input :italian_translation, label: "Italian Translation<br />(Italiano)".html_safe, input_html: { class: 'autogrow', rows: 10 }
      f.input :japanese_translation, label: "Japanese Translation<br />(日本語)".html_safe, input_html: { class: 'autogrow', rows: 10 }
      f.input :korean_translation, label: "Korean Translation<br />(한국어)".html_safe, input_html: { class: 'autogrow', rows: 10 }
      f.input :russian_translation, label: "Russian Translation<br />(Русский)".html_safe, input_html: { class: 'autogrow', rows: 10 }
      f.input :spanish_translation, label: "Spanish Translation<br />(Español)".html_safe, input_html: { class: 'autogrow', rows: 10 }
    end
    f.actions         # adds the 'Submit' and 'Cancel' buttons
  end

  show do
    attributes_table do
      row :id
      row(translation.parent_id.nil? ? 'Page' : 'Screen text'){ |t| t.screen_text }
      unless translation.parent_id.nil?
        row :english_translation
        row :chinese_translation
        row :french_translation
        row :german_translation
        row :italian_translation
        row :japanese_translation
        row :korean_translation
        row :russian_translation
        row :spanish_translation
      end
    end

    if translation.parent_id.nil?
      Translation.all_childrens(translation).each do | sub_text |
        panel sub_text.screen_text do
          attributes_table_for sub_text do
            row :english_translation do
              sub_text.english_translation
            end
            row :chinese_translation do
              sub_text.chinese_translation
            end
            row :french_translation do
              sub_text.french_translation
            end
            row :german_translation do
              sub_text.german_translation
            end
            row :italian_translation do
              sub_text.italian_translation
            end
            row :japanese_translation do
              sub_text.japanese_translation
            end
            row :korean_translation do
              sub_text.korean_translation
            end
            row :russian_translation do
              sub_text.russian_translation
            end
            row :spanish_translation do
              sub_text.spanish_translation
            end
            row "actions" do
              link_to "Edit", [:edit, :admin, sub_text]
            end
          end
        end
      end
    end
  end
end
