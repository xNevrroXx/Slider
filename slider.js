//selectorSlider as string, then as arguments - properties
String.prototype.slider = function( 
    { //arguments
    carousel = true, numFirstSlide = 1 , btnPrevSelector = "standartBtn", btnNextSelector = "standartBtn", infinity = false,
    navs = false, counter = true, widthContainerStr, slidesToShow = 1, slidesToScroll = 1, autoplay = false, autoplaySpeed = 2000} ) 
    { //function
    const sliderContainer = document.querySelector(this);
    sliderContainer.querySelectorAll(`${this} > *`).forEach( contentBlock => {
        contentBlock.className = "slide";
    });
    createMainDOMStructure();
    
    let indexCurrentSlider = localStorage.getItem(`indexCurrentSlider${this}`) ? +localStorage.getItem(`indexCurrentSlider${this}`) : numFirstSlide,
        slidesContentArr = document.querySelectorAll(`${this} .slide`), //кол-во элементов(слайдов) в контейнере
        width,
        dotsNav = [],
        dotsNavWrapper,
        autoplayTrigger,
        startSlidesContentArr;
    const sliderNavsWrapper = sliderContainer.querySelector(".slider-counter");

    const throwErrorsObj = {
        checkNumFirstSlide: () => {
            if( numFirstSlide > (slidesContentArr.length - (slidesToShow-1)) ) {
                throw new Error("the \"numFirstSlide\" cannot be more than the (\"slideContentArr\"-\"slidesToShow-1)\")");
            }
        },
        checkCounter: () => {
            if (counter && (slidesToShow > 1)) {
                throw new Error("It is not possible to use \"counter\" and \"slidesToShow != 1\" together yet.");
            }
        }
    };
    throwErrorsObj.checkNumFirstSlide();
    throwErrorsObj.checkCounter();
    
    createWholeDOM(this);
    

    const sliderContentWrapper = sliderContainer.querySelector(".slider-wrapper"),
        prevSliderBtn = sliderNavsWrapper.querySelector(".slider-btnPrev"),
        nextSliderBtn = sliderNavsWrapper.querySelector(".slider-btnNext");

    changeContentSlider(this);

    slidesContentArr = document.querySelectorAll(`${this} .slider-wrapper > *`);
    if(infinity) startInfinitySlides(); //Not working now
    setIndexes(slidesContentArr);
    setStyles(this);

    if(autoplay) initAutoplay();

    nextSliderBtn.addEventListener("click", () => {
        indexToNextSlider();
        ifInfinityTo("right");
        changeContentSlider(this);
    });

    prevSliderBtn.addEventListener("click", () => {
        indexToPrevSlider();
        ifInfinityTo("left");
        changeContentSlider(this);
    });

    if(navs) {
        dotsNavWrapper.addEventListener("click", (e) => {
            const target = e.target;
            if (target.classList.contains("slider-dot") &&
                !target.classList.contains("slider-dot_active")) {
                indexCurrentSlider = +target.dataset.index + 1;
                changeContentSlider(this);
            }
        });
    }





    //functions
    function startInfinitySlides() {
        startSlidesContentArr = [...slidesContentArr];
        if(infinity && slidesContentArr.length > 1) {
            const tempSlidesArrForInfinity = [...slidesContentArr, ...slidesContentArr, ...slidesContentArr];
            // setIndexes(tempSlidesArrForInfinity)
            slidesContentArr = tempSlidesArrForInfinity;
            replaceContentForInfinity(slidesContentArr);
        }
    }

    function ifInfinityTo(side) {
        if(infinity) {
            if(side == 'right') {
                const deletedElem = slidesContentArr.splice(0,1);
                slidesContentArr.push(...deletedElem);
            }else if (side == 'left') {
                const deletedElem = slidesContentArr.splice(slidesContentArr.length-2,1);
                slidesContentArr.unshift(...deletedElem);
            }
            console.log(slidesContentArr);
            replaceContentForInfinity(slidesContentArr);
        }
    }

    function replaceContentForInfinity(elements) {
        sliderContentWrapper.innerHTML = '';
        elements.forEach(slide => {
            const copyElement = slide.cloneNode(true);
            sliderContentWrapper.insertAdjacentElement("beforeend", copyElement);
        });
        setWidthSlides();
    }

    function setStyles(selectorSlider) {
        if(widthContainerStr) {
            sliderContainer.style.width = widthContainerStr;
        }

        if(slidesToShow > 1) {
            setWidthSlides();
            setWidthSliderWrapper(selectorSlider);
            sliderContentWrapper.style.left = `calc(-${width} * ${indexCurrentSlider - 1})`;
        } else {
            slidesContentArr.forEach(slide => {
                slide.style.width = `${window.getComputedStyle(sliderContainer).width}`;
            });

            if(carousel) {
                setWidthSliderWrapper(selectorSlider);
                sliderContentWrapper.style.left = `calc(-${width} * ${indexCurrentSlider - 1})`;
            } else showOneSlide();
        }
    }
    function setWidthSlides() {
        slidesContentArr.forEach(slide => {
            slide.style.width = `
                ${toFloatNumber(window.getComputedStyle(sliderContainer).width) / (slidesToShow)}px
            `;
        });
    }

    function setWidthSliderWrapper(selectorSlider) {
        width = window.getComputedStyle(document.querySelector(`${selectorSlider} .slide`)).width;
        sliderContentWrapper.style.width = `calc( ${width} * ${slidesContentArr.length})`;
    }

    function createMainDOMStructure() {
        const startContent = sliderContainer.innerHTML;

        sliderContainer.innerHTML = `
            <div class="slider-counter">
            </div>

            <div class="slider-wrapper-long">
                <div class="slider-wrapper">
                    ${startContent}
                </div>
            </div>
        `;
    }

    function createWholeDOM(sliderSelector) {
        //создание всей DOM-структуры(slidercontent, navArrows, navDots)
        if(navs) { //если передан "navs"
            sliderContainer.insertAdjacentHTML("beforeend", `
                <div class="slider__nav-dots">
                </div>
            `);
            dotsNavWrapper = sliderContainer.querySelector(`.slider__nav-dots`);
            createNavsForSlider();
        }
    
        if (counter && (slidesToShow > 1)) {
            throw new Error("It is not possible to use \"counter\" and \"slidesToShow != 1\" together.");
        } else if(counter) {   
            sliderNavsWrapper.innerHTML = `
                <span id="current">${getZero(indexCurrentSlider)}</span>
                /
                <span id="total">${getZero(slidesContentArr.length)}</span>
            `;
        }
    
        if(btnPrevSelector != "standartBtn" && btnNextSelector != "standartBtn") {    // если использовать custom кнопки
            sliderNavsWrapper.insertAdjacentHTML("afterbegin", `
                <div class="slider-btnPrev">
                </div>
            `);
            sliderNavsWrapper.insertAdjacentHTML("beforeend", `
                <div class="slider-btnNext">
                </div>
            `);

            const btnNext = document.querySelector(`${sliderSelector} ~ ${btnNextSelector}`),
                  btnPrev = document.querySelector(`${sliderSelector} ~ ${btnPrevSelector}`);

            sliderNavsWrapper.querySelector(`.slider-btnPrev`).insertAdjacentElement("afterbegin", btnPrev.cloneNode(true));
            sliderNavsWrapper.querySelector(`.slider-btnNext`).insertAdjacentElement("afterbegin", btnNext.cloneNode(true));
    
            btnNext.remove();
            btnPrev.remove();
        } else if ( (btnPrevSelector == "standartBtn") && (btnNextSelector == "standartBtn") ) {     //если хотя бы один из этих агрументов не передан - создаются стандартные переключатели
            sliderNavsWrapper.insertAdjacentHTML("afterbegin", `
                <div class="slider-btnPrev">
                    <img src="icons/left.svg" alt="prev">
                </div>
            `);
            sliderNavsWrapper.insertAdjacentHTML("beforeend", `
                <div class="slider-btnNext">
                    <img src="icons/right.svg" alt="next">
                </div>
            `);
        }
    }

    function showOneSlide() {
        slidesContentArr.forEach(content => {
            content.classList.remove("slide_active");
            content.classList.add("slide_hidden");
            if(content.dataset.index == indexCurrentSlider - 1) {
                content.classList.remove("slide_hidden");
                content.classList.add("slide_active");
            }
        });
    }

    function changeContentSlider(sliderSelector) {
        if(autoplay) { //обнуляет таймер, чтобы не было перелистывания "подряд"
            console.log(true);
            initAutoplay();
        }
        
        if( counter && (slidesToShow == 1) ) {
            setCounter();
        }
        
        if(navs) { //если nav передан в функцию(если есть nav меню)
            dotsNav.forEach( dot => {
                dot.classList.remove("slider-dot_active");
                if(dot.dataset.index == indexCurrentSlider - 1) {
                    dot.classList.add("slider-dot_active");
                }
            });
        }

        //смена контента слайда
        switch(carousel) {
            case true: 
                if(slidesToShow > 1) { 
                    if(infinity) {
                        break; //если бесконечный слайдер - то перелистывание происходит за счет удаления одного из элементов
                    } else if(indexCurrentSlider < slidesContentArr.length) {
                        sliderContentWrapper.style.left = `calc(-${width} * ${indexCurrentSlider - 1})`;
                    }
                } else {
                    sliderContentWrapper.style.left = `calc(-${width} * ${indexCurrentSlider - 1})`;
                }
                break;
            case false:
                // Статично
                showOneSlide();
                break;
        }

        localStorage.setItem(`indexCurrentSlider${sliderSelector}`, indexCurrentSlider);
    }

    function setCounter() {
        const counterSliderTotal = sliderNavsWrapper.querySelector("#total"),
            counterSliderCurrent = sliderNavsWrapper.querySelector("#current");

        counterSliderCurrent.innerHTML = getZero(indexCurrentSlider);
        counterSliderTotal.innerHTML = getZero(slidesContentArr.length);
    }

    function createNavsForSlider() {    
        for(let i = 0; i < slidesContentArr.length; i++) {
            dotsNav[i] = document.createElement("div");
            dotsNav[i].classList.add("slider-dot");

            dotsNavWrapper.insertAdjacentElement("beforeend", dotsNav[i]);
        }
        dotsNav[indexCurrentSlider-1].classList.add("slider-dot_active");
        setIndexes(dotsNav);
    }

    function indexToNextSlider() {
        if( indexCurrentSlider+(slidesToShow-1) >= slidesContentArr.length && !infinity ) { // Если крайняя правая позиция слайдера
            indexCurrentSlider = 1;
        } else { // Если есть возсожность пролистнуть хотя бы на 1 слайд вправо
            let counter = 0;
            do {
                counter++;
            }while( (indexCurrentSlider + counter < (slidesContentArr.length-(slidesToShow-1))) 
                    &&
                    (counter < slidesToScroll) );

            indexCurrentSlider += counter;
        }
    }

    function indexToPrevSlider() {
        if( indexCurrentSlider == 1 && !infinity) { // Если крайняя левая позиция слайдера
            indexCurrentSlider = slidesContentArr.length - (slidesToShow - 1);
        } else { // Если есть возсожность пролистнуть хотя бы на 1 слайд влево
            let counter = 0;
            do {
                counter++;
            }while( (indexCurrentSlider - counter > 1) && (counter < slidesToScroll) );
            indexCurrentSlider -= counter;
        } 
    }

    function initAutoplay() { //создает или сбрасывает время атвоматического перелистывания слайдера
        if(autoplayTrigger) {
            clearInterval(autoplayTrigger);
        }

        autoplayTrigger  = setInterval(() => {
            indexToNextSlider();
            changeContentSlider(this);
        }, autoplaySpeed);
    }
};