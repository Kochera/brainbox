const axios = require("axios")
const md = require('markdown-it')()

md.use(require("markdown-it-asciimath"))

export default class Page {

  constructor(containerId, file) {
    this.file = file
    this.containerId = containerId
  }

  render( ) {
    let container = $("<div class='authorPage'></div>")
    $(this.containerId).html(container)
    axios.get(`../backend/global/sheet/get?filePath=${this.file}`)
      .then((response => {
        let document = response.data.json
        document.forEach( (section, index) => {
          switch(section.type){
            case "brain":
              this.renderBrain(container, section)
              break
            case "markdown":
              this.renderMarkdown(container, section)
              break
            default:

              break
          }
        })
        container.append(` 
            <footer>
            Coded with ♥ and the powerful <a href="http://www.draw2d.org" target="_blank">Draw2D</a> library by Andreas Herz
            </footer>
        `)
      }))
  }


  renderMarkdown(container, section){
    let markdown = md.render(section.content)
    container.append(markdown)
  }

  renderBrain(container, section){
    container.append(`<img src="${section.content.image}">` )
  }

}

