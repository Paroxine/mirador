(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');
    const floatingAddressElement = document.getElementById('floatingAddress');
    const floatingPortElement = document.getElementById('floatingPort');
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            var addressPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (!addressPattern.test(floatingAddressElement.value)) {
                console.log(floatingAddressElement.value)
                event.preventDefault()
                event.stopPropagation()
                floatingAddressElement.classList.add('is-invalid');
            }
            var portPattern = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/;
            if (!portPattern.test(floatingPortElement.value)) {
                console.log(floatingPortElement.value)
                event.preventDefault()
                event.stopPropagation()
                floatingPortElement.classList.add('is-invalid');
            }
        }, false)
    })

    floatingAddressElement.addEventListener('change', (event) => {
        floatingAddressElement.classList.remove('is-invalid')
    })

    floatingPortElement.addEventListener('change', (event) => {
        floatingPortElement.classList.remove('is-invalid')
    })

})()