#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <winsock2.h> 
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib") 

#include "cJSON.h"

#define PORT 8080
#define BUFFER_SIZE 2048      //缓冲区大小
#define MAX_CONNECTIONS 1     //最大连接等待数
#define MAX_COMMAND_LENGTH 16     //存储解析出的命令类型

// 命令执行逻辑，待确认
void execute_command(const char* command, char* response_buffer) {
    char cmd_type[MAX_COMMAND_LENGTH + 1] = {0};  
    const char* payload = NULL;   // 命令附带的负载数据，如"LOAD_DATA [1,2,3]"中负载数据[1,2,3]
    
    if (sscanf(command, "%s", cmd_type) != 1) {
        strncpy(response_buffer, "{\"status\":\"error\",\"message\":\"Invalid empty command\"}",BUFFER_SIZE - 1);  //  读取传来指令，若为空返回错误
        response_buffer[BUFFER_SIZE - 1] = '\0';
        return;
    }

    payload = strchr(command, ' '); 
    if (payload != NULL) {
        payload++; 
        while (*payload && isspace((unsigned char)*payload)) {    // 判断是否为空白字符
            payload++;  // 跳过连续的空格
        }   
    }
    
    if (strcmp(cmd_type, "PING") == 0) {
        strncpy(response_buffer, "{\"status\":\"PONG\", \"message\":\"C_Server is running\"}",BUFFER_SIZE - 1);
        response_buffer[BUFFER_SIZE - 1] = '\0';
    } else if (strcmp(cmd_type, "LOAD_DATA") == 0) {
        if (payload && strlen(payload) > 0) {   // 检查负载是否存在且非空
            cJSON *json_array = cJSON_Parse(payload); // 解析 payload 中的 JSON 字符串
        
            if (json_array == NULL) {
                strncpy(response_buffer, "{\"status\":\"error\", \"message\":\"Failed to parse JSON payload\"}",BUFFER_SIZE - 1);
                response_buffer[BUFFER_SIZE - 1] = '\0';
            } else {
                int array_size = cJSON_GetArraySize(json_array); // 获取 JSON 数组的元素个数
                // 添加 数据结构 插入逻辑（后续业务逻辑）
                cJSON_Delete(json_array); // 释放 cJSON 解析后内存
                snprintf(response_buffer, BUFFER_SIZE, "{\"status\":\"ok\",\"message\":\"Successfully indexed %d songs\"}", array_size);  //  构建成功响应：告诉调用方成功索引了多少首歌曲
            }
        } else {
            strncpy(response_buffer, "{\"status\":\"error\",\"message\":\"LOAD_DATA command requires data\"}",BUFFER_SIZE - 1);  //  有 LOAD_DATA 命令，但无负载（json文件）
            response_buffer[BUFFER_SIZE - 1] = '\0';
        }
    } else {
        snprintf(response_buffer, BUFFER_SIZE, "{\"status\":\"error\", \"message\":\"Unknown Command: %s\"}", cmd_type);  //  未知指令，返回
    }
}

// 客户端请求处理函数
void handle_client_request(SOCKET client_socket) {
    char buffer[BUFFER_SIZE] = {0};   // 定义接收缓冲区：存储客户端发来的命令（初始化为0）
    char response[BUFFER_SIZE] = {0};  // 定义响应缓冲区：存储要返回给客户端的结果（初始化为0）

    int timeout = 5000;
    setsockopt(client_socket, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof(timeout));  //  设置socket超时

    int bytes_received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0); 

    if (bytes_received > 0) {

        buffer[bytes_received] = '\0'; 
        printf("Received command: %s\n", buffer);  // 测试

        execute_command(buffer, response);

        const char* send_ptr = response;  // 指向要发送的数据起始位置
        int total_to_send = strlen(response);  // 要发送的总字节数（JSON响应长度）
        int total_sent = 0;   // 已发送的字节数
        while (total_sent < total_to_send) {
            int bytes_sent = send(client_socket, send_ptr + total_sent, total_to_send - total_sent, 0);  // 每次发送"未发完的剩余数据"
            if (bytes_sent == SOCKET_ERROR) {
                printf("Send failed with error: %d\n", WSAGetLastError());
                break; 
            }
            total_sent += bytes_sent; 
        }

        if (total_sent == total_to_send) {
            printf("Response sent: %d bytes.\n", total_sent);
        } else {
            printf("Only sent %d of %d bytes.\n", total_sent, total_to_send);
        }
        
    } else {
        printf("Client disconnected or error during recv: %d\n", WSAGetLastError());
    }

    if (closesocket(client_socket) == SOCKET_ERROR) {
        printf("Failed to close socket. Error: %d\n", WSAGetLastError());
    }
    printf("Connection closed.\n");  
}

int main() {
    // Winsock 初始化
    // MAKEWORD(2,2)：指定使用Winsock 2.2版本；&wsa：把初始化信息存入wsa变量
    WSADATA wsa;    // 定义WSAData结构体变量：用来存储Winsock初始化的信息
    int ret = WSAStartup(MAKEWORD(2,2), &wsa);
    if (ret != 0) {
        printf("Winsock Initialization Failed. Error Code: %d\n", WSAGetLastError());
        return 1;
    } else {
        printf("Winsock Initialized.\n");
    }
    
    // 定义Socket相关变量： server_fd：服务端Socket句柄（服务端的通信端口号）; new_socket：客户端Socket句柄（和单个客户端通信的“通道”）
    SOCKET server_fd, new_socket;
    struct sockaddr_in address;    // 定义sockaddr_in结构体：存储IP地址、端口等网络地址信息（IPv4专用）
    int addrlen = sizeof(address);    // 计算address结构体的大小（bind/accept函数需要）

    //创建 Socket 文件描述符 (类型：AF_INET IPv4, SOCK_STREAM TCP)
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == INVALID_SOCKET) {
        printf("Socket creation failed. Error: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    } else {
        printf("Socket bilud success. server_fd = %u\n",(unsigned int)server_fd);
    }
    
    // 设置地址结构
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY; 
    address.sin_port = htons(PORT);  // htons()：把主机字节序的端口号转成网络字节序

    //绑定 Socket 到端口（把server_fd和8080端口绑定，让客户端能找到这个端口）
    int bind_result = bind(server_fd, (struct sockaddr *)&address, sizeof(address));  //bind()函数：将Socket和指定的IP+端口关联
    if (bind_result == SOCKET_ERROR) {
        printf("Bind failed. Error: %d\n", WSAGetLastError());
        closesocket(server_fd);
        WSACleanup();
        return 1;
    }

    //监听连接（让服务端Socket进入“监听状态”，等待客户端连接）
    int listen_result = listen(server_fd, MAX_CONNECTIONS);  //服务端Socket；最大等待连接数（MAX_CONNECTIONS=1）
    if (listen_result == SOCKET_ERROR) {
        printf("Listen failed. Error: %d\n", WSAGetLastError());
        closesocket(server_fd);
        WSACleanup();
        return 1;
    } else {
        printf("C Core Server listening on port %d\n", PORT);
    }
    

    // 主循环：接受并处理连接
    while(1) {
        printf("\nWaiting for a connection...\n");
        
        // 接受客户端连接（调用会阻塞）
        // accept()函数：从等待队列中取出一个客户端连接，返回“客户端Socket句柄”
        // (struct sockaddr *)&address：存储客户端的IP和端口；&addrlen：地址结构体大小
        new_socket = accept(server_fd, (struct sockaddr *)&address, &addrlen);
        if (new_socket == INVALID_SOCKET) { 
            printf("Accept failed. Error: %d\n", WSAGetLastError());   //连接失败，跳过等待下一次来连接
            continue;
        }

        // 使用 inet_ntoa 打印客户端 IP （把网络字节序的IP地址转成字符串）
        // ntohs() 把网络字节序的端口转成主机字节序
        printf("Connection established with %s:%d\n", inet_ntoa(address.sin_addr), ntohs(address.sin_port));
        
        //处理客户端请求
        handle_client_request(new_socket);
        
        closesocket(new_socket); 
        printf("Connection closed.\n");
    }
    
}

//server 启动

// (失效)
//gcc socket_server.c -o socket_server -mconsole -lws2_32 ;  if ($?) { .\socket_server }

// 现用（添加了cJson的编译）
//gcc socket_server.c cJSON.c -o socket_server -mconsole -lws2_32 ;  if ($?) { .\socket_server }