import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import Parser from "rss-parser";
import moment from "moment";
import "moment/locale/ru";

const parser = new Parser()

interface State {
  items?: Parser.Item[];
  error?: Error;
}

function NewsListItem(props: { item: Parser.Item; index: number }) {
  const icon = '➡️'
  const date = getDate(props.item);

  return (
    <List.Item
      icon={icon}
      title={props.item.title ?? "Без названия"}
      accessories={[{ text: `${date}` }]}
      actions={<Actions item={props.item} />}
    />
  );
}

function getDate(item: Parser.Item) {
  return moment(item.pubDate).fromNow();
}

function Actions(props: { item: Parser.Item }) {
  return (
    <ActionPanel title={props.item.title}>
      <ActionPanel.Section>
        {props.item.link && <Action.OpenInBrowser url={props.item.link} />}
        {props.item.link && (
          <Action.CopyToClipboard
            content={props.item.link}
            title="Copy Link"
            shortcut={{ modifiers: ["cmd"], key: "." }}
          />
        )}
      </ActionPanel.Section>
      
    </ActionPanel>
  );
}

export default function Command() {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    async function fetchNews() {
      try {
        const feed = await parser.parseURL("https://rozetked.me/turbo");
        setState({ items: feed.items.slice(0,10) });
      } catch (error) {
        setState({
          error: error instanceof Error ? error : new Error("Что-то пошло не так 🤷‍♂️"),
        });
      }
    }

    fetchNews();
  }, []);

  if (state.error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Проблема с загрузкой материалов ⚠️",
      message: state.error.message,
    });
  }

  return (
    <List isLoading={!state.items && !state.error}>
      {state.items?.map((item, index) => (
        <NewsListItem key={item.guid} item={item} index={index} />
      ))}
    </List>
  );
}