import { useRef, useEffect } from "react";
import { Button } from "@oja/ui";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Simple rich text editor using contenteditable
 * Supports basic formatting: bold, italic, headings, lists, links
 */
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="border rounded">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("formatBlock", "<h1>")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("formatBlock", "<h2>")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px bg-gray-300 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={insertLink}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-50 outline-none prose prose-sm max-w-none"
        style={{ overflowWrap: "break-word" }}
      />
    </div>
  );
}
