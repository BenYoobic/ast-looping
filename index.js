const fs = require('fs');
const path = require('path');
const recast = require('recast');
const types = require('ast-types');
const tsParser = require("recast/parsers/typescript")

const baseLocation = '/Users/benyoobic/Documents/playground/ast-looping/components';

/**
 * Reads and returns the file content of a given file
 * @param {*} fileOrDirectory 
 */
function getFileContents(fileOrDirectory) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileOrDirectory, 'utf8', (err, fileContents) => {
            if (err) {
                reject(err);
            }
            const fileContent = JSON.stringify(fileContents);
            resolve(fileContent);
        });
    })
}

/**
 * Recursively trawls though a given directory and looks for files with
 * the .stories.tsx file extention
 * @param {*} dir 
 */
function walkThoughDirectories(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(fileOrDirectory => {
        fileOrDirectory = dir + '/' + fileOrDirectory;
        const stat = fs.statSync(fileOrDirectory);
        if (stat && stat.isDirectory()) {
            walkThoughDirectories(fileOrDirectory);
        } else {
            if (fileOrDirectory.includes('stories.tsx')) {
                getFileContents(fileOrDirectory)
                    .then((fileContent) => {
                        const filename = path.basename(fileOrDirectory);
                        const componentName = 'yoo-' + filename.replace('.stories.tsx', '');
                        prepareStories(componentName, fileContent);
                        // console.log(fileContent);
                    });
            };
        }
    });
}

// 3. Use AST to read the file
// 4. extract the JS AST content
// 5. Extract the HTML AST content
function prepareStories(componentName, fileContent) {
    if (fileContent.indexOf('cartesian(storiesOf') > 0) {
        fileContent = fileContent.substring(0, fileContent.indexOf('cartesian(storiesOf'));
        // console.log('cartesian content       ' + fileContent);
    }
    let stories = fileContent.split(' .add(');
    // console.log('stories length    ' + stories.length)
    stories.shift();
    // console.log('stories length after shift     ' + stories.length)
    // why are we getting rid of first story??


    const jsTagStart = '() => {';
    const jsTagEnd = '}, { notes';
    const htmlTag = '() => `';
    const htmlEnd = '`';
    const htmlSimpleTag = '() => \'';
    const htmlSimpleEnd = '\'';

    let variations = [];

    stories.forEach((story, index) => {
        let storyName = story.substring(story.indexOf('\'') + 1);
        storyName = storyName.substring(0, storyName.indexOf('\''));
        // n.b this name will include spaces and a dash for variations
        // console.log('story name post substring   ' + storyName);

        if (story.indexOf(jsTagStart) >= 0) {
            //it s a js story
            let jsStory = story.substring(story.indexOf(jsTagStart) + jsTagStart.length, story.indexOf(jsTagEnd));
            let lastReturnIndex = jsStory.lastIndexOf('return ');
            let returnLine = jsStory.substring(lastReturnIndex);
            returnLine = returnLine.replace('return ', 'document.body.appendChild(').replace(';', ');');
            jsStory = (jsStory.substring(0, jsStory.lastIndexOf('return ')) + returnLine).replace(/\\n/g, "\n");
            if (storyName.includes('-')) {
                variations.push({ name: storyName, type: 'js', content: jsStory });
            }
            // console.log('js variation added  ' + variations);
        } else if (story.indexOf(htmlTag) >= 0) {
            //its an html story
            let htmlStory = story.substring(story.indexOf(htmlTag) + htmlTag.length, story.lastIndexOf(htmlEnd)).replace(/\\"/g, "\"").replace(/\\n/g, "\n");
            if (storyName.includes('-')) {
                variations.push({ name: storyName, type: 'html', content: htmlStory });
            }
            // console.log('html variation  added ' + variations);
        } else if (story.indexOf(htmlSimpleTag) >= 0) {
            //its an html story
            let htmlStory = story.substring(story.indexOf(htmlSimpleTag) + htmlSimpleTag.length, story.lastIndexOf(htmlSimpleEnd)).replace(/\\"/g, "\"").replace(/\\n/g, "\n");
            if (storyName.includes('-')) {
                variations.push({ name: storyName, type: 'html', content: htmlStory });
            }
            // console.log('html simple variation  added ' + variations);
        }
    });
    // console.log('variations length    ' + variations.length)
    if (variations.length > 0) {
        // console.log('variations array   ' + variations);
        writeJsonOutput(componentName, variations);
    }
}

function ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    // console.log('dir name    ' + dirname);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

// 6. Write the AST content to JSON
function writeJsonOutput(componentName, variations) {
    console.log('Arrived at writeJsonOutput!');
    console.log('Compoent Name:             ' + componentName);
    console.log('Variations:                ' + variations);
}


function init() {
console.log('init run!');
walkThoughDirectories(baseLocation);
}

init();