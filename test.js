const fs = (await import('fs')).promises;

// notes -> school -> department -> year -> unit
// school/ department/ year/ unit
// notes/${school}/${department}/${year}/${unit}/classNotes
let schools = []
let departments = []
let years = []
let units = []

fs.readdir('notes')
    .then((files1) => {
        // console.log(files1) //School: SCI
        let allButFirst = files1.slice(0,-1)
        schools.push(allButFirst)

        console.log("School - " + schools)

        schools.forEach(school =>{
            fs.readdir(`notes/${school}`)
            .then((files2) => {
                // console.log(files2) //Department: Computer Science
                departments.push(files2)

                console.log("Department - " + departments)

                departments.forEach(department => {

                    fs.readdir(`notes/${school}/${department}`)
                    .then((files3) => {
                        // console.log(files3) //Year: 1.1
                        years.push(files3)

                        console.log("Year - " + years)

                        years[0].forEach(year => {
                            fs.readdir(`notes/${school}/${department}/${year}`)
                            .then((files4) => {
                                // console.log(files4) //Unit: Research methods
                                units.push(files4)

                                console.log("Unit - " + units)

                                // units.forEach(unit => {
                                    
                                // })

                            }).catch(err => {
                               console.log(err)
                            });
                        })
                    }).catch(err => {
                       console.log(err)
                    });
                })


            }).catch(err => {
                console.log(err)
            });
        })

        // read(schools, `notes/SCI`, departments)
    }).catch(err => {
       
    })
