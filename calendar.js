// Calendar functionality exposed as initCalendar()
window.initCalendar = function initCalendar() {
  const calendarDates = document.getElementById('calendarDates');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const currentMonthSpan = document.querySelector('.current-month');
  const dateInput = document.querySelector('.date-input input');

  // If the calendar elements aren't present on the page, do nothing
  if (!calendarDates || !currentMonthSpan || !dateInput) return;

  let currentDate = new Date();
  let selectedDate = new Date(dateInput.value || currentDate.toLocaleDateString('en-US'));

  function updateCalendar() {
    // Clear existing dates
    calendarDates.innerHTML = '';

    // Update month display
    currentMonthSpan.textContent = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(currentDate);

    // Get first day of month and total days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Add padding for first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-date disabled';
      calendarDates.appendChild(emptyDay);
    }

    // Add days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateDiv = document.createElement('div');
      dateDiv.className = 'calendar-date';
      dateDiv.textContent = day;

      // Check if this is the selected date
      const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      if (thisDate.toDateString() === selectedDate.toDateString()) {
        dateDiv.classList.add('current');
      }

      dateDiv.addEventListener('click', () => {
        // Remove current selection
        document.querySelector('.calendar-date.current')?.classList.remove('current');
        dateDiv.classList.add('current');

        // Update selected date
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        dateInput.value = selectedDate.toLocaleDateString('en-US');
      });

      calendarDates.appendChild(dateDiv);
    }
  }

  // Initialize calendar
  updateCalendar();

  // Add month navigation (guard buttons may not exist)
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      updateCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      updateCalendar();
    });
  }
};