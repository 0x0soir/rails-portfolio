class CreateProyectos < ActiveRecord::Migration
  def change
    create_table :proyectos do |t|
      t.string :titulo
      t.text :descripcion
      t.string :imagen

      t.timestamps null: false
    end
  end
end
