/* ============================================================
   Contact form — client-side validation + success state.

   NOTE: This currently does NOT send anywhere. Wire `submitForm`
   to your backend or a service such as Formspree / Netlify Forms:

     async function submitForm(data) {
       await fetch('https://formspree.io/f/XXXXXXXX', {
         method: 'POST',
         headers: { 'Accept': 'application/json' },
         body: new FormData(form),
       })
     }
   ============================================================ */
export function initForm() {
  const form = document.getElementById('contactForm')
  const status = document.getElementById('formStatus')
  if (!form) return

  const setError = (field, on) => field.closest('.field')?.classList.toggle('has-error', on)

  form.addEventListener('submit', async e => {
    e.preventDefault()
    status.textContent = ''

    const required = form.querySelectorAll('[required]')
    let valid = true
    required.forEach(input => {
      const ok = input.checkValidity() && input.value.trim() !== ''
      setError(input, !ok)
      if (!ok) valid = false
    })

    if (!valid) {
      status.style.color = '#c2664f'
      status.textContent = 'Please complete the required fields.'
      return
    }

    const btn = form.querySelector('button[type="submit"]')
    const label = btn.querySelector('span')
    const original = label.textContent
    label.textContent = 'Sending…'
    btn.disabled = true

    try {
      // --- Replace this block with a real submission (see note above) ---
      await new Promise(r => setTimeout(r, 800))
      // -----------------------------------------------------------------
      form.reset()
      status.style.color = 'var(--gold)'
      status.textContent = 'Thank you. Your message has been received — we will be in touch shortly.'
    } catch (err) {
      status.style.color = '#c2664f'
      status.textContent = 'Something went wrong. Please email contato@jccapital.com.br directly.'
    } finally {
      label.textContent = original
      btn.disabled = false
    }
  })

  // Clear error styling as the user corrects a field
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => setError(input, false))
  })
}
