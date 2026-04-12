 import ReactMarkdown from "react-markdown";

export default function MessageBubble({ sender, text }: any) {
  const isUser = sender === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "10px"
      }}
    >
      <div
        style={{
          background: isUser ? "#0d6efd" : "#e9ecef",
          color: isUser ? "white" : "black",
          padding: "10px 15px",
          borderRadius: "15px",
          maxWidth: "60%"
        }}
      >
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}