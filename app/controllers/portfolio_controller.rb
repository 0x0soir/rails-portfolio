class PortfolioController < ApplicationController
  layout 'about'
  def about
    @projects_db = Proyecto.all
    render 'about'
  end
  def projects
    @projects_db = Proyecto.all
    render 'projects'
  end
end
