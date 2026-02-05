// Chrome Console Debugger - Simulate Four Finger Touch
// Copy and paste into Chrome DevTools Console to run

console.log('🐸 Tabbit Translation - 四手指触摸调试脚本')

// Create simulated touch points
function createTouch(x, y, id) {
  return new Touch({
    identifier: id,
    target: document.body,
    clientX: x,
    clientY: y,
    radiusX: 25,
    radiusY: 25,
    rotationAngle: 0,
    force: 1,
  })
}

function simulateFourFingerTap() {
  console.log('🎯 Start simulating four finger touch...')

  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const offset = 50

  const touches = [
    createTouch(centerX - offset, centerY - offset, 1),
    createTouch(centerX + offset, centerY - offset, 2),
    createTouch(centerX - offset, centerY + offset, 3),
    createTouch(centerX + offset, centerY + offset, 4),
  ]

  const touchStartEvent = new TouchEvent('touchstart', {
    touches,
    targetTouches: touches,
    changedTouches: touches,
    bubbles: true,
    cancelable: true,
  })

  document.dispatchEvent(touchStartEvent)
  console.log('✅ TouchStart event triggered (4 fingers)')

  setTimeout(() => {
    const touchEndEvent = new TouchEvent('touchend', {
      touches: [],
      targetTouches: [],
      changedTouches: touches,
      bubbles: true,
      cancelable: true,
    })

    document.dispatchEvent(touchEndEvent)
    console.log('✅ TouchEnd event triggered')
    console.log('🎉 Four finger touch simulation completed!')
  }, 100)
}

function addDebugButton() {
  const button = document.createElement('button')
  button.innerHTML = '🐸 Test four finger touch'
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 15px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
  `
  button.classList.add('notranslate')

  button.addEventListener('click', simulateFourFingerTap)
  document.body.appendChild(button)

  console.log('✅ Debug button added to top right corner')
}

// 立即执行
console.log('🎯 How to use:')
console.log('1. Run simulateFourFingerTap() to simulate four finger touch')
console.log('2. Run addDebugButton() to add a test button to the page')
console.log('')
console.log('💡 Quick test: Run the command below')
console.log('simulateFourFingerTap()')

// Add debug button automatically
addDebugButton()

// Export functions to global
window.simulateFourFingerTap = simulateFourFingerTap
window.addDebugButton = addDebugButton
