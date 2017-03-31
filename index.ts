import {readFileSync} from "fs";
import * as ts from "typescript";
import * as glob from "glob";
import * as path from "path";

export function getDeclarations(sourceFile: ts.SourceFile, dir:string):{[key:string]:boolean} {
    let declarations = {};

    delintNode(sourceFile);

    function delintNode(node: ts.Node) {


        switch (node.kind) {
            case ts.SyntaxKind.ImportDeclaration: {
                let file_path = (node as ts.ImportDeclaration).moduleSpecifier.getText().replace(/[',"]/g, '');

                if(file_path.split('')[0] === '.') {
                    let str = path.normalize(path.join(dir,file_path);
                    declarations[str] = true;
                } else {
                    //declarations[file_path] = true;
                }

                break;
            }
        }

        ts.forEachChild(node, delintNode);
    }

    return declarations;
}

const  fileNamesGlob = '../vision-root/{services,vision}/src/**/*{.ts,.tsx,!Test.ts,!jasmine2.t.ts,!spec.ts}';

let fileNames = glob.sync(fileNamesGlob);


let filesMap = {};

fileNames.forEach(fileName => {
    let normalized = fileName.replace(/\.tsx?/, '');

    if(!(normalized in filesMap)) {
        filesMap[normalized] = 0;
    }

    // Parse a file
    let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.ES2016, /*setParentNodes */ true);

    let declarations = getDeclarations(sourceFile,path.dirname(fileName));

    for(let fn in declarations) {
        if(!(fn in filesMap)) {
            filesMap[fn] = 1;
        } else {
            filesMap[fn] = filesMap[fn] + 1;
        }
    }

});


console.log("************************************************");

for(let file in filesMap) {
    if(filesMap[file] === 1) {
        console.log(`${file} - ${filesMap[file]}`);
    }
}