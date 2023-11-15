;document.addEventListener('DOMContentLoaded', (event) => {

(function($) {

	'use strict';

	let popupTimeoutId;



	// Parallax bg

	$(window).scroll(function() {

  		const scrolledY = $(window).scrollTop();

  		$('[data-parallax-bg]').css('background-position', `center calc(50% + ${scrolledY}px)`);

	});


	//var deadline = new Date(Date.parse(new Date()) + 6 * 24 * 60 * 60 * 1000); // for endless timer
let currDate = new Date();
let deadline = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 4, 0, 0, 0);
initializeClock('timer', deadline);
//timer

function getTimeRemaining(endtime) {
	var t = Date.parse(endtime) - Date.parse(new Date());
	var seconds = Math.floor((t / 1000) % 60);
	var minutes = Math.floor((t / 1000 / 60) % 60);
	var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
	var days = Math.floor(t / (1000 * 60 * 60 * 24));
	return {
	  'total': t,
	  'days': days,
	  'hours': hours,
	  'minutes': minutes,
	  'seconds': seconds
	};
  }
   
  function initializeClock(id, endtime) {
	var clock = document.getElementById(id);
	var daysSpan = clock.querySelector('.days');
	var hoursSpan = clock.querySelector('.hours');
	var minutesSpan = clock.querySelector('.minutes');
	var secondsSpan = clock.querySelector('.seconds');
   
	function updateClock() {
	  var t = getTimeRemaining(endtime);
   
	  daysSpan.innerHTML = t.days;
	  hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
	  minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
	  secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
   
	  if (t.total <= 0) {
		clearInterval(timeinterval);
	  }
	}
   
	updateClock();
	var timeinterval = setInterval(updateClock, 1000);
  }



	const vagonSamplesSlider = (function() {

		const name = 'vagon-samples';

		const slider = new Swiper(`[data-slider="${name}"]`, {

			slidesPerView: 4,

			speed: 400,

			spaceBetween: 40,

			loop: false,

			navigation: {

				nextEl: `[data-slider-next="${name}"]`,

				prevEl: `[data-slider-prev="${name}"]`,

			},

			breakpoints: {

				320: {

					slidesPerView: 1,

					spaceBetween: 20,

				},

				460: {

					slidesPerView: 2,

					spaceBetween: 20,

				},

				770: {

					slidesPerView: 3,

					spaceBetween: 20,

				},

				1201: {

					slidesPerView: 4,

				}

			}

		});

	})();



	const vagonGallerySlider = (function() {

		const name = 'vagon-gallery';

		const slider = new Swiper(`[data-slider="${name}"]`, {

			slidesPerView: 2.2,

			centeredSlides: true,

			speed: 400,

			spaceBetween: 90,

			loop: true,

			navigation: {

				nextEl: `[data-slider-next="${name}"]`,

				prevEl: `[data-slider-prev="${name}"]`,

			},

			pagination: {
				el: `[data-slider-pagination="${name}"]`,
				clickable: true,
				renderBullet: function(index, className) {
					return `<span class="slider-pagination__dot ${className}"></span>`;
				},
			},

			breakpoints: {
				320: {
					slidesPerView: 1,
					spaceBetween: 20,
				},

				460: {
					slidesPerView: 2,
					spaceBetween: 20,
				},

				770: {
					slidesPerView: 3,
					spaceBetween: 20,
				},
				1201: {
					spaceBetween: 90,
					slidesPerView: 2.2,
				}
			}
		});
	})();



	// Phone masks

	(function() {
		$("[data-phonemask]").mask("+7 (999) 999-9999");
	})();



	// Unchecking radio

	document.addEventListener('click', (event) => {
		const { target } = event;
		if (!target.hasAttribute('data-uncheck-radio')) {
			return false;
		}
		event.preventDefault();
		const radio = target.querySelector('input[type="radio"]');
		radio.checked = !radio.checked;
	});

	// Notification

	function Notification(name, quizElement) {
		this.element = quizElement.querySelector(`[data-quiz-notification="${name}"]`);
	}

	Notification.prototype.show = function() {
		this.element.style.display = 'flex';
	}

	Notification.prototype.hide = function() {
		this.element.style.display = 'none';
	}	

	let quizes = { };

	setTimeout(() => {
		if (window.location.hash) {
			const hash = window.location.hash.replace('#', '');

			if (quizes[hash]) {
				quizes[hash].show();
			}
		}
	});

	document.querySelectorAll('[data-quiz]').forEach((quizElement) => {		

		// Popup

		const quizPopup = (function() {

			const quizPopupElement = quizElement.querySelector('[data-quiz-popup]');			

			return {
				show: function() {
					const html = document.querySelector('html');
					const scrollbarWidth = getScrollbarWidth();
					html.style.paddingRight = `${scrollbarWidth}px`;
					html.style.overflow = 'hidden';
					quizPopupElement.style.display = 'block';
					setTimeout(() => {
						quizPopupElement.classList.add('quiz__popup--active');
					});
				},

				hide: function() {
					const html = document.querySelector('html');
					html.style.paddingRight = '';
					html.style.overflow = '';
					quizPopupElement.classList.remove('quiz__popup--active');
					setTimeout(() => {
						quizPopupElement.style.display = '';
					}, 150);
				}
			}

		})();



		quizes[quizElement.getAttribute('data-quiz')] = quizPopup;



		const waitingNotification = new Notification('waiting', quizElement);

		const doneNotification = new Notification('done', quizElement);



		let isBusy = false;



		// Steps

		const quizSteps = (function() {

			const parentElement = quizElement.querySelector('[data-quiz-steps]');

			const stepsElements = parentElement.querySelectorAll('[data-step]');



			// prepare steps display...

			stepsElements.forEach((element, index) => element.style.display = index === 0 ? 'flex' : 'none');
			parentElement.querySelectorAll('[data-quiz-error]').forEach((element) => {
				element.classList.remove('visible')
			});
	

			let currentStepIndex = 0;
			let currentStepElement = [...stepsElements][currentStepIndex];
			let branch = 'master';

			const TRANSITION_DURATION = 400;

			// radio change branches...
			quizElement.addEventListener('change', (event) => {
				const { target } = event;
				if (!target.hasAttribute('data-step-branch')) {
					return false;
				}
				const branchName = target.getAttribute('data-step-branch');
				quizSteps.changeBranch(branchName);
			});

			let prevButtonTimeout;

			const history = (function() {
				let items = [
					// {

					// 	branchName: 'Name of a branch',

					//  element: <HTMLElement>,

					// 	fields: [

					// 		{ name: 'name_of_a_field', value: 'Value of field.' },

					// 	]

					// }
				];

				return {

					clear: function() {
						items = [];
					},

					add: function(branchName, element) {
						let dict = {};
						const fields = [...element.querySelectorAll('[name*="quiz"][type="radio"]:checked, [name*="quiz"][type="text"]')]

							.filter((element) => { 
								const name = element.getAttribute('name');

								if (dict[name]) {
									return false;

								} else {
									dict[name] = true;
									return true;
								}
							})

							.map((element) => {
								return {
									name: element.getAttribute('name'),
									value: element.value
								}
							});

							items.push({
							branchName,
							fields,
							element
						});
					},

					getFields: function() {
						const result = { };
						items.forEach((item) => {
							item.fields.forEach((field) => {
								result[field.name] = field.value;
							});
						});
						return result;
					},

					back: function() {
						return { isEmpty: items.length === 0, ...items.pop() };
					}
				}
			})();

			setTimeout(() => {
				document.addEventListener('keypress', quizSteps.enterKeyHandler.bind(quizSteps));
			});

			return {
				enterKeyHandler: function(event) {
					if (event.key === 'Enter' && !isBusy && this.next()) {
						ymSend();
					}
				},

				clear: function() {
					isBusy = false;
					quizElement.querySelectorAll('[data-radio-group]').forEach((groupElement) => {
						const isDefaultValue = groupElement.getAttribute('data-radio-group');
						groupElement.querySelectorAll('input[type="radio"]').forEach((element, index) => {
							element.checked = index === 0 && isDefaultValue;
						});
					});

					quizElement.querySelectorAll('[data-quiz-text]').forEach((element) => {
						element.value = '';
					});

					parentElement.querySelectorAll('[data-quiz-error]').forEach((element) => {
						element.classList.remove('visible')
					});
				},

				validate: function() {
					let isValid = true;
					const errorShaking = (element) => {
						element.classList.add('error-shake');
						setTimeout(() => {
							element.classList.remove('error-shake');
						}, 400);
					}

					currentStepElement.querySelectorAll('[data-quiz-required]').forEach((element) => {
						const requiredType = element.getAttribute('data-quiz-required');
						switch (requiredType) {
							case 'radio': 
								if (!element.querySelector('input[type="radio"]:checked')) {
									errorShaking(element);
									isValid = false;
								}
								break;

							case 'text': 

								const input = element.querySelector('input[type="text"]');

								if (!input || !input.value) {
									errorShaking(element);
									element.querySelectorAll('[data-quiz-error]').forEach((errorElement) => {
										errorElement.classList.add('visible');
									});

									isValid = false;

								} else if (input) {
									element.querySelectorAll('[data-quiz-error]').forEach((errorElement) => {
										errorElement.classList.remove('visible');
									});
								}

								break;

						}
					});

					return isValid;

				},

				submit: function() {

					clearTimeout(prevButtonTimeout);

					const fields = history.getFields();

					quizPrevButton.disable();

					quizNextButton.disable();

					parentElement.style.display = 'none';

					quizNextButton.setWaiting();

					waitingNotification.show();

					return new Promise((resolve, reject) => {
						fetch('/php/quiz-mail.php', {
							method: 'POST',
							redirect: 'follow',
							referrerPolicy: 'no-referrer',
							body: new URLSearchParams(fields)
						  })

						  .then((response) => response.json())

						  .then((res) => {

							quizNextButton.setDone();
							waitingNotification.hide();
							doneNotification.show();
							resolve();

							setTimeout(() => {
								quizPopup.hide();
								history.clear();
								this.clear();
								currentStepIndex = 0;

								setTimeout(() => {
									doneNotification.hide();
									quizPrevButton.enable();
									quizNextButton.enable();
									quizNextButton.setDefault();
									quizPercentBar.setPercents(0);
									parentElement.style.display = 'flex';
									currentStepElement = [...stepsElements][currentStepIndex];

									stepsElements.forEach((element, index) => {
										if (index === 0) {
											this.fadeIn(element);
										} else {
											element.style.display = 'none';
											element.style.position = 'absolute';
										}
									});
								}, 400);
							}, 4000);
						  })
					});
				},

				changeBranch: function(branchName) {
					branch = branchName;
				},

				fadeOut: function(element) {
					element.style.position = 'absolute';
					element.style.opacity = '0';
					element.style.transform = 'translateX(-40px)';

					setTimeout(() => {
						element.style.display = 'none';
					}, TRANSITION_DURATION);
				},

				fadeIn: function(element) {
					element.style.position = 'static';
					element.style.display = 'flex';
					element.style.opacity = '0';
					element.style.transform = 'translateX(40px)';
					setTimeout(() => {
						element.style.opacity = '1';
						element.style.transform = 'translateX(0)';
					});
				},

				next: function() {
					if (isBusy) {
						return false;
					}
					if (!this.validate()) {
						isBusy = false;
						return false;
					}
					isBusy = true;

					clearTimeout(prevButtonTimeout);
					quizPrevButton.disable();
					history.add(branch, currentStepElement);
					this.fadeOut(currentStepElement);
					let hasFound;
					stepsElements.forEach((element, index) => {
						if (index <= currentStepIndex || hasFound) {
							return false;
						}

						const hasBranchElement = element.getAttribute('data-step-branches').includes(branch);
						if (hasBranchElement) {
							hasFound = true;
							currentStepElement = element;
							currentStepIndex = index;
							const elementBranchChanger = currentStepElement.querySelector('[data-step-branch]:checked');
							if (elementBranchChanger) {
								this.changeBranch(elementBranchChanger.getAttribute('data-step-branch'));
							}

							if (currentStepIndex === [...stepsElements].length - 1) {
								this.submit().then(() => {
									isBusy = false;
								});

							} else {
								this.fadeIn(currentStepElement);
								prevButtonTimeout = setTimeout(() => {
									isBusy = false;
									quizPrevButton.enable();
								}, TRANSITION_DURATION);
							}
							quizPercentBar.setPercents(Math.ceil(( currentStepIndex / (stepsElements.length - 1)) * 100));
						}
					});
					return true;
				},

				prev: function() {
					if (isBusy) {
						return false;
					}

					const { element, branchName, isEmpty } = history.back();
					if (isEmpty) {
						isBusy = false;
						quizPopup.hide();
						return false;
					}

					isBusy = true;
					quizNextButton.disable();
					branch = branchName;
					this.fadeOut(currentStepElement);
					let foundElementIndex = -1, foundElement;
					stepsElements.forEach((stepElement, index) => {
						if (index >= currentStepIndex) {
							return false;
						}
						const isBranchElement = stepElement.getAttribute('data-step-branches').includes(branch);
						if (isBranchElement) {
							foundElement = stepElement;
							foundElementIndex = index;
						}
					});

					if (!foundElementIndex < 0 || !foundElement) {
						return false;
					}

					currentStepElement = foundElement;
					currentStepIndex = foundElementIndex;

					quizPercentBar.setPercents(Math.ceil(( currentStepIndex / (stepsElements.length - 1)) * 100));

					this.fadeIn(currentStepElement);

					setTimeout(() => {
						isBusy = false;
						quizNextButton.enable();
					}, TRANSITION_DURATION);
					return true;
				}				
			}
		})();

		// Prev button
		const quizPrevButton = (function() {
			const element = quizElement.querySelector('[data-quiz-prev]');
			element.addEventListener('click', () => {
				if (quizSteps.prev()) {
					stepNumber --;
				}
			});
			element.addEventListener('focus', () => {
				element.blur();
			});

			return {
				disable: function() {
					element.style.pointerEvents = 'none';
				},
				enable: function() {
					element.style.pointerEvents = 'all';
				},
			}
		})();

		// Next button
		const quizNextButton = (function() {
			const element = quizElement.querySelector('[data-quiz-next]');
			element.addEventListener('click', () => {
				if (quizSteps.next()) {
					ymSend();
				};
			});
			element.addEventListener('focus', () => {
				element.blur();
			});

			return {
				disable: function() {
					element.style.pointerEvents = 'none';
				},
				enable: function() {
					element.style.pointerEvents = 'all';
				},
				setDefault: function() {
					element.classList.remove('quiz__next--waiting');
					element.classList.remove('quiz__next--done');
				},
				setWaiting: function() {
					this.setDefault();
					element.classList.add('quiz__next--waiting');
				},
				setDone: function() {
					this.setDefault();
					element.classList.add('quiz__next--done');
				}
			}
		})();

		// Close button
		const quizCloseButton = quizElement.querySelector('[data-quiz-close]');
		quizCloseButton.addEventListener('click', () => {
			quizPopup.hide();
		});

		// Percent bar
		const quizPercentBar = (function() {
			const element = quizElement.querySelector('[data-quiz-progress]');
			const track = element.querySelector('[data-track]');
			const tooltip = element.querySelector('[data-percent]');
			const filler = element.querySelector('[data-filler]');

			return {
				setPercents: function(percent) {
					tooltip.style.left = `${percent}%`;
					filler.style.width = `${percent}%`;
					tooltip.innerHTML = percent;
				}
			}
		})();
	});

	function getScrollbarWidth() {
		// Creating invisible container
		const outer = document.createElement('div');
		outer.style.visibility = 'hidden';
		outer.style.overflow = 'scroll'; // forcing scrollbar to appear
		outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
		document.body.appendChild(outer);	  

		// Creating inner element and placing it in the container
		const inner = document.createElement('div');
		outer.appendChild(inner);	  

		// Calculating difference between container's full width and the child width
		const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);	  

		// Removing temporary elements from the DOM
		outer.parentNode.removeChild(outer);
		return scrollbarWidth;  
	}

	// Video popup
	(function() {
		const videoFrame = document.querySelector('[data-popup-video]');
		$('[data-popup-video-btn]').magnificPopup({
			type: 'inline',
			midClick: true,
			mainClass: 'mfp-fade',
			callbacks: {
				beforeOpen: function() {
					const magnificPopup = $.magnificPopup.instance;
					const [ button ] = magnificPopup.st.el;
					const videoId = button.getAttribute('data-video-id');
					videoFrame.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1`)
				},

				afterClose: function() {
					videoFrame.setAttribute('src', '_blank');
				},
			}
		});
	})();
		// Form handling
		(function() {
			document.addEventListener('click', (event) => {
				const { target } = event;
				if (!target.hasAttribute('data-request-from-btn')) {
					return false;
				}
				const value = target.getAttribute('data-request-from-btn');
				const input = document.querySelector( target.getAttribute('href') ).querySelector('[data-request-from]');
				input.value = value || 'Главная страница';
			});

			document.addEventListener('click', (event) => {
				const { target } = event;
				if (!target.hasAttribute('data-popup-close')) {
					return false;
				}		

				$.magnificPopup.close();
			});		

			const $hiddenThanksLink = $('<a href="#success-popup"></a>');
			$hiddenThanksLink.magnificPopup({ type: 'inline', mainClass: 'mfp-fade', callbacks: {
				beforeClose: function() {
					clearTimeout(popupTimeoutId);
				}
			} });	

			const clearErrorsForm = (form) => {
				const errorClasses = [
					'text-input--error', 
					'text-area--error'
				];

				form.querySelectorAll('input[name], textarea[name]').forEach((element) => {
					element.classList.remove(...errorClasses);
				});
			}	

			const clearForm = (form) => {
				const agreementCheckbox = form.querySelector('[data-form-agreement]');
				if (agreementCheckbox) {
					form.querySelector('[data-form-agreement]').checked = false;
				}
				form.querySelectorAll('input[name][type="text"], input[name][type="email"], textarea[name]').forEach((element) => {
					element.value = '';
				});
				clearErrorsForm(form);
			}	

			async function sendData(url, form) {
				const response = await fetch(url, {
					method: 'POST',
					redirect: 'follow',
					referrerPolicy: 'no-referrer',
					body: new URLSearchParams(new FormData(form))
				  });
				  return response.json();
			}	

			const errorForm = (form, errors) => {
				clearErrorsForm(form);
				for (let field in errors) {
					form.querySelector(`[name="${field}"]`)
						.classList.add('text-input--error', 'text-area--error');
				}
			}		

			document.addEventListener('submit', async (event) => {
				const { target } = event;
				if (!target.hasAttribute('data-form-element')) {
					return false;
				}	

				event.preventDefault();

				const agreementCheckbox = target.querySelector('[data-form-agreement]');
				if (agreementCheckbox && !agreementCheckbox.checked) {
					alert('Укажите о согласии на обработку персональных данных.');
					return false;
				}	

				target.closest('[data-form]').classList.add('form-loading');
				const startTime = performance.now();				

				// End...

				const { errors, m } = await sendData('/php/mail.php', target);
				if (Object.keys(errors).length) {
					errorForm(target, errors);
					const timePassed = performance.now() - startTime;
					setTimeout(() => {
						target.closest('[data-form]').classList.remove('form-loading');
					}, timePassed > 300 ? 0 : 300 - timePassed);
					return false;
				}

				target.closest('[data-form]').classList.remove('form-loading');
				clearForm(target);
				$.magnificPopup.close();	

				popupTimeoutId = setTimeout(() => {
					$.magnificPopup.close();
				}, 3000);	

				$hiddenThanksLink.magnificPopup('open');
			});
		})();		

		// Start buttons

		document.addEventListener('click', (event) => {
			const { target } = event;
			if (!target.hasAttribute('data-quiz-start')) {
				return false;
			}
			const quizName = target.getAttribute('data-quiz-start');

			if (quizes[quizName]) {
				quizes[quizName].show();
			}
		});

		//let ymSteps = ['step1', 'step2', 'step3', 'send'];
		//let stepNumber = -1;
		//function ymSend() {
		//	stepNumber ++;
		//	ym(94161754,'reachGoal', ymSteps[stepNumber]);
		//	console.log(ymSteps[stepNumber]);
		//}		


})(jQuery);

});