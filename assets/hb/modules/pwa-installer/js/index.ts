import * as params from '@params';

(() => {
  const remember = (choice: string): void => {
    if (choice === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', 'true')
      localStorage.setItem('pwa-install-dismissed-at', Date.now().toString())
    } else {
      localStorage.removeItem('pwa-install-dismissed')
    }
  }

  const wrapper = document.querySelector('#pwa-installer')
  if (wrapper === null) {
    return
  }

  // do not show the button if users have already dismissed it.
  const dismissedPeriod = (params.pwa_installer.dismissed_period ?? 604800) * 1000
  if (localStorage.getItem('pwa-install-dismissed') !== null) {
    if (Date.now() - parseInt(localStorage.getItem('pwa-install-dismissed-at') ?? '0') < dismissedPeriod) {
      return
    }
  }

  const dismiss = (): void => {
    wrapper.classList.add('dismissing')
    setTimeout(() => {
      wrapper.classList.remove('dismissing')
      wrapper.classList.add('d-none')
    }, 1500)
  }

  const btn = wrapper.querySelector('.btn-pwa-install') as HTMLButtonElement
  const closeBtn = wrapper.querySelector('.btn-close') as HTMLButtonElement

  closeBtn.addEventListener('click', () => {
    remember('dismissed')
    dismiss()
  })

  const delay = (params.pwa_installer.delay ?? 5) * 1000
  let prompt: Event | null = null
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    wrapper.classList.remove('d-none')
    setTimeout(dismiss, delay)
    prompt = e
  })

  btn.addEventListener('click', async (): void => {
    if (prompt == null) {
      return
    }
    const result = await prompt.prompt()
    remember(result.outcome)
    disablePrompt()
  })

  window.addEventListener('appinstalled', () => {
    disablePrompt()
  })

  const disablePrompt = (): void => {
    prompt = null
    dismiss()
  }
})()
