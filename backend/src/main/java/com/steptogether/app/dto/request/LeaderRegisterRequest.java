package com.steptogether.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaderRegisterRequest {

    @NotBlank(message = "Tên leader không được để trống")
    private String name;
}
