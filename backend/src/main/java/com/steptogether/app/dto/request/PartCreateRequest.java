package com.steptogether.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PartCreateRequest {

    @NotBlank(message = "Tên part không được để trống")
    private String name;

    private String description;

    private List<TodoItem> todoList;

    @Getter
    @Setter
    public static class TodoItem {
        @NotBlank(message = "Tiêu đề todo không được để trống")
        private String title;
        private String description;
    }
}
