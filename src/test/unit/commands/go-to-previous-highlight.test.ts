import TextEditor from '../../../lib/text-editor';
import {assertEqual, mock, mockMethods, mockType, verify, when} from '../../helpers/helper';
import TextLocationRegistry from '../../../lib/text-location-registry';
import MatchingModeRegistry from '../../../lib/matching-mode-registry';
import StringPattern from '../../../lib/patterns/string';
import {TextEditorDecorationType} from 'vscode';
import DecorationRegistry from '../../../lib/decoration-registry';
import {Decoration} from '../../../lib/entities/decoration';
import WindowComponent from '../../../lib/editor-components/window';
import {GoToPreviousHighlightCommand} from '../../../lib/commands/go-to-previous-highlight';

suite('Go-to-previous-highlight command', function () {

    const matchingModeRegistry = mockType<MatchingModeRegistry>();

    const registeredRange1 = {start: 10, end: 15};
    const registeredRange2 = {start: 30, end: 35};
    const registeredRange3 = {start: 40, end: 45};
    const unregisteredRange = {start: 15, end: 19};

    const newPattern = new StringPattern({phrase: 'TEXT'});
    const decorationType = mockType<TextEditorDecorationType>();

    const textLocationRegistry = new TextLocationRegistry();
    textLocationRegistry.register('EDITOR_ID', 'DECORATION_ID', [registeredRange1, registeredRange2, registeredRange3]);

    const decorationRegistry = mock(DecorationRegistry);
    when(decorationRegistry.issue(newPattern)).thenReturn(mockType<Decoration>({decorationType, pattern: newPattern}));
    when(decorationRegistry.inquireById('DECORATION_ID')).thenReturn(mockType<Decoration>({id: 'DECORATION_ID', decorationType}));

    suite('when the cursor is on a highlight and not the first one of the same pattern', () => {

        const editor = mockType<TextEditor>({id: 'EDITOR_ID', selection: {start: 31, end: 31}});
        const windowComponent = mockType<WindowComponent>({visibleTextEditors: [editor]});

        const command = new GoToPreviousHighlightCommand(matchingModeRegistry, textLocationRegistry, decorationRegistry, windowComponent);

        test('takes you to the previous highlight of the pattern', async () => {
            await command.execute(editor);
            assertEqual(editor.selection, {start: 10, end: 15});
        });
    });

    suite('when the cursor is on a highlight and the first one of the same pattern', () => {

        const editor = mockType<TextEditor>({id: 'EDITOR_ID', selection: {start: 11, end: 11}});
        const windowComponent = mockType<WindowComponent>({visibleTextEditors: [editor]});

        const command = new GoToPreviousHighlightCommand(matchingModeRegistry, textLocationRegistry, decorationRegistry, windowComponent);

        test('takes you to the last highlight of the pattern', async () => {
            await command.execute(editor);
            assertEqual(editor.selection, {start: 40, end: 45});
        });
    });

    suite('when the cursor is NOT on highlight', () => {

        const editor = mockMethods<TextEditor>(['setDecorations'], {
            id: 'EDITOR_ID',
            selection: unregisteredRange,
            selectedText: 'TEXT',
            wholeText: 'abc TEXT defgh TEXT ijkl TEXT'
        });
        const windowComponent = mockType<WindowComponent>({visibleTextEditors: [editor]});

        const command = new GoToPreviousHighlightCommand(matchingModeRegistry, textLocationRegistry, decorationRegistry, windowComponent);

        test('It highlights and take you to the previous highlight', async () => {
            await command.execute(editor);

            verify(editor.setDecorations(decorationType, [{start: 4, end: 8}, unregisteredRange, {start: 25, end: 29}]));
            assertEqual(editor.selection, {start: 4, end: 8});
        });
    });
});
