import React, { useEffect, useRef } from 'react'
import Select from 'react-select'

const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      width: state.selectProps.width,
      borderBottom: '1px dotted pink',
      color: '#000',
      padding: 20,
    }),
  
    // control: (_, { selectProps: { width }}) => ({
    //   width: width
    // }),
  
    // singleValue: (provided, state) => {
    //   // const opacity = state.isDisabled ? 0.5 : 1;
    //   // const transition = 'opacity 300ms';
  
    //   return { ...provided };
    // }
  }

const backgroundFilterOptions = [
    { value: 'Background-', label: 'No Selection'},
    { value: 'Background-A1', label: 'Orange Creamsicle' },
    { value: 'Background-A2', label: 'Hot Pink' },
    { value: 'Background-A3', label: 'Summer Blue' },
    { value: 'Background-A4', label: 'Tiel Green' },
    { value: 'Background-A5', label: 'Lemon Yellow' },
    { value: 'Background-A6', label: 'Faded Red' } 
]
const skinFilterOptions = [
    { value: 'Skin-', label: 'No Selection'},
    { value: 'Skin-B2', label: 'Sport Orange' },
    { value: 'Skin-B3', label: 'Flare Purple' },
    { value: 'Skin-B4', label: 'Carolina Blue' },
    { value: 'Skin-B5', label: 'Dessert Green' },
    { value: 'Skin-B6', label: 'Classic Grey' },
    { value: 'Skin-B7', label: 'Forest Green' },
    { value: 'Skin-B8', label: 'Strawberry' },
    { value: 'Skin-B9', label: 'Naval Blue' },
    { value: 'Skin-B10', label: 'Troubled Red' },
    { value: 'Skin-B11', label: 'Citrus Yellow' },
    { value: 'Skin-B12', label: 'Royal Blue' },
    { value: 'Skin-B13', label: 'Robotic Grey' },
    { value: 'Skin-B14', label: 'Notorious N.F.T' },
    { value: 'Skin-B15', label: 'Leopard Print' },
    { value: 'Skin-B16', label: 'Bright Gradient' },
    { value: 'Skin-B17', label: 'Paint Splatter' },
    { value: 'Skin-B18', label: 'Camoflauge' },
    { value: 'Skin-B19', label: 'Rock Orange' },
    { value: 'Skin-B20', label: 'All Eyez On Me' },
    { value: 'Skin-B21', label: 'Reptilian Green' }
]
const clothesFilterOptions = [
    { value: 'Clothes-', label: 'No Selection'},
    { value: 'Clothes-E1', label: 'Thriller Gangster'},
    { value: 'Clothes-E2', label: 'Lounging Gangster'},
    { value: 'Clothes-E3', label: 'Lax Bro'},
    { value: 'Clothes-E4', label: 'Stepping Out Turtleneck'},
    { value: 'Clothes-E5', label: 'Cuban Link'},
    { value: 'Clothes-E6', label: 'Blue Hawaiian with Sharktooth'},
    { value: 'Clothes-E7', label: 'Iced TV Chain'},
    { value: 'Clothes-E8', label: 'Construction Vest'},
    { value: 'Clothes-E9', label: 'Sunday Gangster'},
    { value: 'Clothes-E10', label: 'Old School Turtleneck and Jacket'},
    { value: 'Clothes-E11', label: 'Navy Turtleneck'},
    { value: 'Clothes-E12', label: 'MurderNeck'},
    { value: 'Clothes-E13', label: 'Notorious Sweater'},
    { value: 'Clothes-E14', label: 'KillerAlls'},
    { value: 'Clothes-E15', label: 'Bulletproof'},
    { value: 'Clothes-E16', label: 'Turtleneck with Iced TV Chain'},
    { value: 'Clothes-E17', label: 'Fur Hood Puffer with Basically Gav TM Chain'},
    { value: 'Clothes-E18', label: 'Fur Hood Puffer'},
    { value: 'Clothes-E19', label: 'Lightning Garb'},
    { value: 'Clothes-E20', label: 'Market Garb'},
    { value: 'Clothes-E21', label: 'Flannel'},
    { value: 'Clothes-E22', label: 'Red Hawaiian'},
    { value: 'Clothes-E23', label: 'Uncle Sam'},
    { value: 'Clothes-E24', label: 'Sharktooth Ooh-Ah-Ah'},
    { value: 'Clothes-E25', label: 'Christmas Gangster'},
    { value: 'Clothes-E26', label: 'Turtle Tee'},
    { value: 'Clothes-E27', label: 'Scrubs'},
    { value: 'Clothes-E28', label: 'Western'},
    { value: 'Clothes-E29', label: 'Rambo'},
    { value: 'Clothes-E30', label: 'Turtle TM'},
    { value: 'Clothes-E31', label: 'Night Shift'},
    { value: 'Clothes-E32', label: 'Bandit'},
    { value: 'Clothes-E33', label: 'Going Fast'},
    { value: 'Clothes-E34', label: 'Puffer Vest Only'},
    { value: 'Clothes-E35', label: 'Puffer Vest Casual'},
    { value: 'Clothes-E36', label: 'SuperTurtle'},
    { value: 'Clothes-E37', label: 'All Business'},
    { value: 'Clothes-E38', label: 'Sacrement Chain'},
    { value: 'Clothes-E39', label: 'None'}
]
const paintFilterOptions = [
    { value: 'Paint-', label: 'No Selection'},
    { value: 'Paint-G1', label: 'Teardrop Tattoo'},
    { value: 'Paint-G2', label: '2022 Tattoo'},
    { value: 'Paint-G3', label: 'Band-Aid'},
    { value: 'Paint-G4', label: 'Nose Stud'},
    { value: 'Paint-G5', label: 'Turtleverse Tattoo'},
    { value: 'Paint-G6', label: 'Eye Black'},
    { value: 'Paint-G1', label: 'None'}    
]
const mouthFilterOptions = [
    { value: 'Mouth-', label: 'No Selection'},
    { value: 'Mouth-F2', label: 'Unfazed'},
    { value: 'Mouth-F3', label: 'Mouthguard'},
    { value: 'Mouth-F4', label: 'Iced Out Grill'},
    { value: 'Mouth-F5', label: 'Blue Bandit'},
    { value: 'Mouth-F6', label: 'Smirking'},
    { value: 'Mouth-F7', label: '5 o\'clock Shadow Stoner'},
    { value: 'Mouth-F8', label: 'Cheesin\''},
    { value: 'Mouth-F9', label: 'Packin\' a Chaw'},
    { value: 'Mouth-F10', label: 'Red Bandit'},
    { value: 'Mouth-F11', label: 'Mr. Mustache'},
    { value: 'Mouth-F12', label: 'Silly Tongue'},
    { value: 'Mouth-F13', label: 'Hungry'},
    { value: 'Mouth-F14', label: 'Surgical Mask'},
    { value: 'Mouth-F15', label: 'Frowning'},
    { value: 'Mouth-F16', label: 'Braces'},
    { value: 'Mouth-F17', label: 'Blank Face'},
    { value: 'Mouth-F19', label: 'Biker'},
    { value: 'Mouth-F20', label: 'Bruh'},
    { value: 'Mouth-F21', label: 'Stiff'},
    { value: 'Mouth-F22', label: 'Chainsmoke'},
    { value: 'Mouth-F23', label: 'Stoner'},
    { value: 'Mouth-F24', label: 'Stogie'},
    { value: 'Mouth-F25', label: 'E-Cig'},
    { value: 'Mouth-F27', label: 'Champagne'},
    { value: 'Mouth-F28', label: 'Old School Smoker'},
    { value: 'Mouth-F29', label: 'Party Boy'},
    { value: 'Mouth-F30', label: 'Bubble Gum'},
    { value: 'Mouth-F31', label: 'Lollipop'},
    { value: 'Mouth-F32', label: 'Lover Boy'},
    { value: 'Mouth-F33', label: 'Blowing Clouds'},
    { value: 'Mouth-F34', label: 'Crybaby'},
    { value: 'Mouth-F35', label: 'DatAss'},
]
const eyeFilterOptions = [
    { value: 'Eyes-', label: 'No Selection'},
    { value: 'Eyes-I1', label: 'Red Haze' },
    { value: 'Eyes-I2', label: 'Clear Blue' },
    { value: 'Eyes-I3', label: 'Cyborg' },
    { value: 'Eyes-I4', label: 'Designer Shades' },
    { value: 'Eyes-I5', label: 'Nerd' },
    { value: 'Eyes-I6', label: 'Green Haze' },
    { value: 'Eyes-I7', label: 'Bug Eye' },
    { value: 'Eyes-I8', label: 'Disguise' },
    { value: 'Eyes-I9', label: 'Hero Mask' },
    { value: 'Eyes-I10', label: 'Squints' },
    { value: 'Eyes-I11', label: 'Old School Shades' },
    { value: 'Eyes-I12', label: 'Blindfold' },
    { value: 'Eyes-I13', label: 'Chrome Futures' },
    { value: 'Eyes-I14', label: 'Johnny Futures' },
    { value: 'Eyes-I15', label: 'Blue Light Glasses' },
    { value: 'Eyes-I16', label: 'Bouncer Futures' },
    { value: 'Eyes-I17', label: 'Ski Goggles' },
    { value: 'Eyes-I18', label: 'Hm...' },
    { value: 'Eyes-I19', label: 'Hypnotized' },
    { value: 'Eyes-I20', label: 'Cupid' },
    { value: 'Eyes-I21', label: 'HeatVision' },
    { value: 'Eyes-I22', label: 'Sewed' },
    { value: 'Eyes-I23', label: 'CryBaby' },
    { value: 'Eyes-I24', label: 'Resting' },
    { value: 'Eyes-I25', label: 'Blinders' }
]
const headwearFilterOptions = [
    { value: 'Headwear-', label: 'No Selection'},
    { value: 'Headwear-J1', label: 'Ski Mask' },
    { value: 'Headwear-J2', label: 'Bucket Hat' },
    { value: 'Headwear-J3', label: 'Flow Bucket' },
    { value: 'Headwear-J4', label: 'Blue Headband Fro' },
    { value: 'Headwear-J5', label: 'Red Handband Fro' },
    { value: 'Headwear-J6', label: 'Bandana' },
    { value: 'Headwear-J7', label: 'Skullcap' },
    { value: 'Headwear-J9', label: 'Market Hat' },
    { value: 'Headwear-J10', label: 'Hex Fade' },
    { value: 'Headwear-J11', label: 'Santa' },
    { value: 'Headwear-J12', label: 'War Cap' },
    { value: 'Headwear-J13', label: 'Visor' },
    { value: 'Headwear-J14', label: 'The Gambler' },
    { value: 'Headwear-J15', label: 'The Artist' },
    { value: 'Headwear-J16', label: 'Beanie' },
    { value: 'Headwear-J17', label: 'King\'s Cap' },
    { value: 'Headwear-J18', label: 'Turtlebacks' },
    { value: 'Headwear-J19', label: 'None' },
    { value: 'Headwear-J20', label: 'Gangster Slick' }
]

export default function FilterSelects(props) {
    // https://stackoverflow.com/questions/50412843/how-to-programmatically-clear-reset-react-select
    // try to hoist state up from this component, keep the clear button here 
    const selectInputRef = useRef();

    // const onClear = () => {
    // };
    
    useEffect(() => {
        if (props.areFiltersClear===true && selectInputRef.current.select) {
            selectInputRef.current.select.clearValue();
        }
    }, [props.areFiltersClear])

    return (
        <>
            <Select          
                ref={selectInputRef}
                onChange={props.filter}
                placeholder={"Background"}
                options={backgroundFilterOptions}
                styles={customStyles} 
            />
            <Select 
                onChange={props.filter}
                placeholder={"Skin"}
                options={skinFilterOptions}
                styles={customStyles} 
            />
            <Select 
                onChange={props.filter}
                placeholder={"Eyes"}
                options={eyeFilterOptions}
                styles={customStyles} 
            />
            <Select 
                onChange={props.filter}
                placeholder={"Mouth"}
                options={mouthFilterOptions}
                styles={customStyles} 
            />
            <Select 
                onChange={props.filter}
                placeholder={"Clothes"}
                options={clothesFilterOptions}
                styles={customStyles} 
                />
            <Select 
                onChange={props.filter}
                placeholder={"Paint"}
                options={paintFilterOptions}
                styles={customStyles} 
            />
            <Select 
                onChange={props.filter}
                placeholder={"Headwear"}
                options={headwearFilterOptions}
                styles={customStyles} 
            />
        </>
    )
}