namespace :dbmigrate do
  task :run => :environment do
    # Open a database
    db = SQLite3::Database.new "db/development.sqlite3"
    db.execute( "select * from proyectos" ) do |row|
      Proyecto.create(titulo:row[1],descripcion:row[2],imagen:row[3],lenguaje: row[6], url:row[7])
    end
  end
end
