class AddLenguajeToProyecto < ActiveRecord::Migration
  def change
    add_column :proyectos, :lenguaje, :string
  end
end
