async function LoadData() {
    let res = await fetch("http://localhost:3000/posts")
    let posts = await res.json();
    let body = document.getElementById("body_table");
    body.innerHTML = '';
    for (const post of posts) {
        let isDeleted = post.isDeleted === true;
        let style = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
        body.innerHTML += `<tr ${style}>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
           <td><input type="submit" value="Delete" onclick="Delete( ${post.id})"/></td>
        </tr>`
    }

}
async function Save() {
    let id = document.getElementById("id_txt").value.trim();
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    
    // Nếu ID trống, tạo mới và tự động tăng ID
    if (!id) {
        try {
            // Lấy tất cả posts để tìm maxId
            let allPostsRes = await fetch('http://localhost:3000/posts');
            let allPosts = await allPostsRes.json();
            let maxId = 0;
            for (const post of allPosts) {
                let postId = parseInt(post.id);
                if (!isNaN(postId) && postId > maxId) {
                    maxId = postId;
                }
            }
            id = String(maxId + 1);
            
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Thanh cong");
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        // Kiểm tra xem post có tồn tại không
        let getItem = await fetch('http://localhost:3000/posts/' + id);
        if (getItem.ok) {
            let existingPost = await getItem.json();
            let res = await fetch('http://localhost:3000/posts/'+id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: existingPost.id,
                    title: title,
                    views: views,
                    isDeleted: existingPost.isDeleted || false
                })
            });
            if (res.ok) {
                console.log("Thanh cong");
            }
        } else {
            // Nếu không tồn tại, tạo mới với ID đã nhập
            try {
                let res = await fetch('http://localhost:3000/posts', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: id,
                        title: title,
                        views: views,
                        isDeleted: false
                    })
                });
                if (res.ok) {
                    console.log("Thanh cong");
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    LoadData();
    LoadComments();
    return false;



}
async function Delete(id) {
    // Xóa mềm: thêm isDeleted: true
    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let post = await getItem.json();
        let res = await fetch("http://localhost:3000/posts/" + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: true
            })
        });
        if (res.ok) {
            console.log("Thanh cong");
        }
    }
    LoadData();
    return false;
}

// ========== COMMENTS CRUD ==========
async function LoadComments() {
    let res = await fetch("http://localhost:3000/comments");
    let comments = await res.json();
    let body = document.getElementById("body_comments_table");
    if (!body) return;
    body.innerHTML = '';
    for (const comment of comments) {
        let isDeleted = comment.isDeleted === true;
        let style = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
        let editButton = isDeleted ? '' : `<input type="submit" value="Edit" onclick="EditComment(${comment.id})"/> `;
        body.innerHTML += `<tr ${style}>
            <td>${comment.id}</td>
            <td>${comment.text}</td>
            <td>${comment.postId}</td>
            <td>${editButton}<input type="submit" value="Delete" onclick="DeleteComment(${comment.id})"/></td>
        </tr>`
    }
}

async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value.trim();
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;
    
    // Nếu ID trống, tạo mới và tự động tăng ID
    if (!id) {
        try {
            // Lấy tất cả comments để tìm maxId
            let allCommentsRes = await fetch('http://localhost:3000/comments');
            let allComments = await allCommentsRes.json();
            let maxId = 0;
            for (const comment of allComments) {
                let commentId = parseInt(comment.id);
                if (!isNaN(commentId) && commentId > maxId) {
                    maxId = commentId;
                }
            }
            id = String(maxId + 1);
            
            let res = await fetch('http://localhost:3000/comments', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    text: text,
                    postId: postId,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Thanh cong");
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        // Kiểm tra xem comment có tồn tại không
        let getItem = await fetch('http://localhost:3000/comments/' + id);
        if (getItem.ok) {
            let existingComment = await getItem.json();
            // Kiểm tra nếu comment đã bị xóa mềm thì không cho update
            if (existingComment.isDeleted === true) {
                console.log("Khong the chinh sua comment da xoa");
                return false;
            }
            let res = await fetch('http://localhost:3000/comments/'+id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: existingComment.id,
                    text: text,
                    postId: postId,
                    isDeleted: existingComment.isDeleted || false
                })
            });
            if (res.ok) {
                console.log("Thanh cong");
            }
        } else {
            // Nếu không tồn tại, tạo mới với ID đã nhập
            try {
                let res = await fetch('http://localhost:3000/comments', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: id,
                        text: text,
                        postId: postId,
                        isDeleted: false
                    })
                });
                if (res.ok) {
                    console.log("Thanh cong");
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    LoadComments();
    return false;
}

async function EditComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id);
    if (res.ok) {
        let comment = await res.json();
        // Kiểm tra nếu comment đã bị xóa mềm thì không cho edit
        if (comment.isDeleted === true) {
            console.log("Khong the chinh sua comment da xoa");
            return false;
        }
        document.getElementById("comment_id_txt").value = comment.id;
        document.getElementById("comment_text_txt").value = comment.text;
        document.getElementById("comment_postId_txt").value = comment.postId;
    }
    return false;
}

async function DeleteComment(id) {
    // Xóa mềm: thêm isDeleted: true
    let getItem = await fetch('http://localhost:3000/comments/' + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        let res = await fetch("http://localhost:3000/comments/" + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...comment,
                isDeleted: true
            })
        });
        if (res.ok) {
            console.log("Thanh cong");
        }
    }
    LoadComments();
    return false;
}

function ClearCommentForm() {
    document.getElementById("comment_id_txt").value = '';
    document.getElementById("comment_text_txt").value = '';
    document.getElementById("comment_postId_txt").value = '';
}

// Load dữ liệu khi trang được tải
LoadData();
LoadComments();
