  /*
    single chomp, just chomp the string and check for each code (for loop inside of a while loop)
    a = codes to check
    s = full combo code
  */
export default function checkForAllMatches(a, s) {
    while ( ( ( s.length-1 ) > 0 ) && ( a.length > 0 ) ) {
        // console.log(s)
        a.forEach((code, i) => {
            // check for match
            var firstThreeChars = s.slice(0, 3)
            // if (firstThreeChars === "B2") {
            //   debugger
            // }
            var match = ( code === firstThreeChars.slice(0, code.length) )
            if (match) {
                    // we also need to check if code is length 2 and second 2 of three to slice is NOT a number
                    if (( code.length === 2 ) && ( Number(s.slice(1,3)).length>1 ) && ( Number(s.slice(1,3)) >= 0 )) {
                    console.log('NO MATCH. BROADCHECKING: ', a[i])
                    } else {
                    // if theres a true match, delete the match from the codes array (a). If we empty 
                    // out this array, the while loop will stop, and we will recheck this condition
                    // on the final return. 
                    console.log('MATCH FOUND: ', a[i])
                    console.log('sliced check to match: ', s.slice(0, code.length))
                    a.splice(i, 1);
                    console.log('a after match found: ', a)
                    }

            }
        })
        // slice substring of s after checking each of the codes for a match
        s = s.slice(1)
    }
    // if we haven't emptied out the checks, return false cos we didn't match ALL element
    return (a.length > 0) ? false : true
}