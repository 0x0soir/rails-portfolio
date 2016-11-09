class AddUrlToProyecto < ActiveRecord::Migration
  def change
    add_column :proyectos, :url, :string
  end
end
