let schoolSelect = document.getElementById('school')
let yearSelect = document.getElementById('year')
let departmentSelect = document.getElementById('department')
let unitSelect = document.getElementById('unit')
let warnBtn = document.getElementById('warn')

if (schoolSelect.value == 'SCI') {
    departmentSelect.innerHTML = `
        <option value="Computer_Science" default>Computer Science</option>
        <option value="Information Technology">Information Technology</option>
    ` 
}

schoolSelect.addEventListener('change', (e) => {
    if (schoolSelect.value == 'SCI') {
        departmentSelect.innerHTML = `
            <option value="Computer_Science" default>Computer Science</option>
            <option value="Information Technology">Information Technology</option>
        ` 
        console.log("CHANGED")
    } else if(schoolSelect.value == 'SOBE') {
        departmentSelect.innerHTML = `
            <option value="Business Administration" default>Business Administration</option>
            <option value="Economics">Economics</option>
        ` 
        console.log("CHANGED")
    }
})

yearSelect.addEventListener('change', (e) => {
    if (yearSelect.value == 'Year_2.2' && schoolSelect.value == 'SCI' && departmentSelect.value == 'Computer_Science') {
        unitSelect.innerHTML = `
            <option value="Data_structures_and_algorithms" default>Data strcutures and algorithms</option>
            <option value="Research methodology">Research methodology</option>
        ` 
    } 
})

unitSelect.addEventListener('change', (e) => {
    if(schoolSelect.value === '' || yearSelect.value === '' || departmentSelect.value === '' || unitSelect.value === '') {
        warnBtn.style.display = 'block'
    } else {
        warnBtn.style.display = 'none'
    }    
})


