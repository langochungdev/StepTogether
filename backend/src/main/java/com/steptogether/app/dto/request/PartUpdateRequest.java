package com.steptogether.app.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PartUpdateRequest {

    private String name;
    private String description;

    private List<TodoItem> todoList;

    @Getter
    @Setter
    public static class TodoItem {
        private String id;          // optional, cho todo đã tồn tại
        private String title;
        private String description;
    }
}
